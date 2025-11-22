import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener conversaciones para admin
export async function GET(req: Request) {
    try {
        const conversaciones = await prisma.conversacion.findMany({
            where: {
                OR: [
                    { requiere_humano: true },
                    { estado: 'humano' }
                ]
            },
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

        return NextResponse.json({ success: true, conversaciones });
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
