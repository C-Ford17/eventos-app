import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
    try {
        const services = await prisma.productoServicio.findMany({
            select: {
                id: true,
                nombre: true,
                descripcion: true,
                categoria: true,
                precio_base: true,
                disponibilidad: true,
                bloqueado: true,
                imagen_url: true,
                proveedor_id: true,
                proveedor: {
                    select: {
                        nombre: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({
            success: true,
            services,
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener servicios' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { serviceId, action } = await req.json();

        if (!serviceId || !action) {
            return NextResponse.json(
                { success: false, error: 'Datos incompletos' },
                { status: 400 }
            );
        }

        if (action === 'block' || action === 'unblock') {
            const service = await prisma.productoServicio.update({
                where: { id: serviceId },
                data: { bloqueado: action === 'block' },
                include: {
                    proveedor: {
                        select: { id: true, nombre: true }
                    }
                }
            });

            // Crear notificación para el proveedor
            await prisma.notificacion.create({
                data: {
                    usuario_id: service.proveedor_id,
                    tipo: action === 'block' ? 'servicio_bloqueado' : 'servicio_desbloqueado',
                    mensaje: action === 'block'
                        ? `Tu servicio "${service.nombre}" ha sido bloqueado por el administrador. Contacta al soporte para más información.`
                        : `Tu servicio "${service.nombre}" ha sido desbloqueado y ahora es visible para los organizadores.`,
                    leida: false,
                },
            });

            // Registrar acción en auditoría
            const adminId = req.headers.get('x-user-id') || 'admin';
            await createAuditLog({
                usuario_id: adminId,
                accion: action === 'block' ? 'bloquear_servicio' : 'desbloquear_servicio',
                tabla: 'productos_servicios',
                registro_id: serviceId,
                detalles: `Servicio "${service.nombre}" ${action === 'block' ? 'bloqueado' : 'desbloqueado'}`,
            });

            return NextResponse.json({
                success: true,
                message: `Servicio ${action === 'block' ? 'bloqueado' : 'desbloqueado'} correctamente`,
            });
        }

        if (action === 'approve' || action === 'reject') {
            await prisma.productoServicio.update({
                where: { id: serviceId },
                data: { disponibilidad: action === 'approve' },
            });

            return NextResponse.json({
                success: true,
                message: `Servicio ${action === 'approve' ? 'aprobado' : 'rechazado'} correctamente`,
            });
        }

        return NextResponse.json(
            { success: false, error: 'Acción no válida' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error updating service:', error);
        return NextResponse.json(
            { success: false, error: 'Error al actualizar servicio' },
            { status: 500 }
        );
    }
}
