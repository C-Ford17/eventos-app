import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener conversaciones para admin
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const last_updated = searchParams.get('last_updated');

        const whereCondition = {
            OR: [
                { requiere_humano: true },
                { estado: 'humano' }
            ]
        };

        // Optimización: Verificar si hubo cambios antes de cargar todo
        if (last_updated) {
            const ultimaConversacion = await prisma.conversacion.findFirst({
                where: whereCondition,
                orderBy: { updatedAt: 'desc' },
                select: { updatedAt: true }
            });

            if (!ultimaConversacion) {
                // Si no hay conversaciones activas y el cliente tenía datos,
                // enviamos lista vacía para que limpie.
                // Si el cliente ya tenía vacío (last_updated muy antiguo o null), igual enviamos vacío.
                return NextResponse.json({ success: true, conversaciones: [] });
            }

            const lastUpdatedDate = new Date(last_updated).getTime();
            const currentUpdatedDate = new Date(ultimaConversacion.updatedAt).getTime();

            if (currentUpdatedDate <= lastUpdatedDate) {
                return NextResponse.json({ success: true, modified: false });
            }
        }

        // Carga completa si hay cambios o es la primera vez
        const conversaciones = await prisma.conversacion.findMany({
            where: whereCondition,
            include: {
                usuario: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                        tipo_usuario: true
                    }
                },
                admin: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                mensajes: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        remitente: {
                            select: { id: true, nombre: true }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ success: true, conversaciones, modified: true });
    } catch (error: any) {
        console.error('Error obteniendo conversaciones:', error);
        return NextResponse.json(
            { error: 'Error al obtener conversaciones' },
            { status: 500 }
        );
    }
}

// PATCH - Tomar conversación o actualizar estado
export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { conversacion_id, admin_id, accion } = body;

        if (!conversacion_id || !admin_id) {
            return NextResponse.json(
                { error: 'conversacion_id y admin_id son requeridos' },
                { status: 400 }
            );
        }

        if (accion === 'tomar') {
            // Admin toma la conversación
            const conversacion = await prisma.conversacion.update({
                where: { id: conversacion_id },
                data: {
                    admin_id,
                    estado: 'humano'
                },
                include: {
                    usuario: {
                        select: { id: true, nombre: true, email: true, tipo_usuario: true }
                    },
                    mensajes: {
                        orderBy: { createdAt: 'asc' },
                        include: {
                            remitente: {
                                select: { id: true, nombre: true }
                            }
                        }
                    }
                }
            });

            return NextResponse.json({ success: true, conversacion });
        }

        if (accion === 'cerrar') {
            // Cerrar conversación
            const conversacion = await prisma.conversacion.update({
                where: { id: conversacion_id },
                data: { estado: 'cerrada' }
            });

            return NextResponse.json({ success: true, conversacion });
        }

        return NextResponse.json(
            { error: 'Acción no válida' },
            { status: 400 }
        );

    } catch (error: any) {
        console.error('Error actualizando conversación:', error);
        return NextResponse.json(
            { error: 'Error al actualizar conversación' },
            { status: 500 }
        );
    }
}
