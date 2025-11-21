import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
    try {
        const events = await prisma.evento.findMany({
            select: {
                id: true,
                nombre: true,
                descripcion: true,
                fecha_inicio: true,
                fecha_fin: true,
                ubicacion: true,
                aforo_max: true,
                estado: true,
                bloqueado: true,
                imagen_url: true,
                organizador_id: true,
                organizador: {
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
            events,
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener eventos' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { eventId, action } = await req.json();

        if (!eventId || !action) {
            return NextResponse.json(
                { success: false, error: 'Datos incompletos' },
                { status: 400 }
            );
        }

        if (action === 'block' || action === 'unblock') {
            const event = await prisma.evento.update({
                where: { id: eventId },
                data: { bloqueado: action === 'block' },
                include: {
                    organizador: {
                        select: { id: true, nombre: true }
                    }
                }
            });

            // Crear notificación para el organizador
            await prisma.notificacion.create({
                data: {
                    usuario_id: event.organizador_id,
                    tipo: action === 'block' ? 'evento_bloqueado' : 'evento_desbloqueado',
                    mensaje: action === 'block'
                        ? `Tu evento "${event.nombre}" ha sido bloqueado por el administrador. Contacta al soporte para más información.`
                        : `Tu evento "${event.nombre}" ha sido desbloqueado y ahora es visible para los usuarios.`,
                    leida: false,
                },
            });

            // Registrar acción en auditoría
            const adminId = req.headers.get('x-user-id') || 'admin';
            await createAuditLog({
                usuario_id: adminId,
                accion: action === 'block' ? 'bloquear_evento' : 'desbloquear_evento',
                tabla: 'eventos',
                registro_id: eventId,
                detalles: `Evento "${event.nombre}" ${action === 'block' ? 'bloqueado' : 'desbloqueado'}`,
            });

            return NextResponse.json({
                success: true,
                message: `Evento ${action === 'block' ? 'bloqueado' : 'desbloqueado'} correctamente`,
            });
        }

        return NextResponse.json(
            { success: false, error: 'Acción no válida' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json(
            { success: false, error: 'Error al actualizar evento' },
            { status: 500 }
        );
    }
}
