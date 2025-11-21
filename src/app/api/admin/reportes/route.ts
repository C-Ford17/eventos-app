// src/app/api/admin/reportes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const tipo = searchParams.get('tipo');
        const estado = searchParams.get('estado');
        const prioridad = searchParams.get('prioridad');

        const reportes = await prisma.reporte.findMany({
            where: {
                ...(tipo && tipo !== 'todos' && { tipo_reporte: tipo }),
                ...(estado && estado !== 'todos' && { estado }),
                ...(prioridad && prioridad !== 'todos' && { prioridad }),
            },
            include: {
                reportante: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
                evento: {
                    select: {
                        id: true,
                        nombre: true,
                    },
                },
                servicio: {
                    select: {
                        id: true,
                        nombre: true,
                    },
                },
                usuario_reportado: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    },
                },
                admin: {
                    select: {
                        nombre: true,
                    },
                },
            },
            orderBy: [
                { prioridad: 'desc' }, // Crítica > Alta > Media > Baja
                { createdAt: 'desc' },
            ],
        });

        return NextResponse.json({
            success: true,
            reportes,
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener reportes' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { reporteId, action, admin_id, respuesta_admin } = body;

        if (!reporteId || !action) {
            return NextResponse.json(
                { success: false, error: 'Datos incompletos' },
                { status: 400 }
            );
        }

        let nuevoEstado = '';
        let mensaje = '';

        switch (action) {
            case 'review':
                nuevoEstado = 'en_revision';
                mensaje = 'Reporte marcado como en revisión';
                break;
            case 'resolve':
                nuevoEstado = 'resuelto';
                mensaje = 'Reporte marcado como resuelto';
                break;
            case 'reject':
                nuevoEstado = 'rechazado';
                mensaje = 'Reporte rechazado';
                break;
            default:
                return NextResponse.json(
                    { success: false, error: 'Acción no válida' },
                    { status: 400 }
                );
        }

        const reporte = await prisma.reporte.update({
            where: { id: reporteId },
            data: {
                estado: nuevoEstado,
                ...(admin_id && { admin_id }),
                ...(respuesta_admin && { respuesta_admin }),
            },
            include: {
                reportante: {
                    select: { id: true, nombre: true }
                },
                evento: {
                    select: { nombre: true }
                },
                servicio: {
                    select: { nombre: true }
                },
                usuario_reportado: {
                    select: { nombre: true }
                }
            }
        });

        // Notificar al reportante del cambio de estado
        await prisma.notificacion.create({
            data: {
                usuario_id: reporte.reportante_id,
                tipo: 'reporte_actualizado',
                mensaje: `Tu reporte ha sido ${nuevoEstado === 'en_revision' ? 'revisado' : nuevoEstado}${respuesta_admin ? ': ' + respuesta_admin : ''}`,
                leida: false,
            },
        });

        // Registrar en auditoría
        const adminIdFinal = admin_id || req.headers.get('x-user-id') || 'admin';
        await createAuditLog({
            usuario_id: adminIdFinal,
            accion: `${action}_reporte`,
            tabla: 'reportes',
            registro_id: reporteId,
            detalles: `Reporte de ${reporte.tipo_reporte} ${nuevoEstado}`,
        });

        return NextResponse.json({
            success: true,
            message: mensaje,
            reporte,
        });
    } catch (error) {
        console.error('Error updating report:', error);
        return NextResponse.json(
            { success: false, error: 'Error al actualizar reporte' },
            { status: 500 }
        );
    }
}
