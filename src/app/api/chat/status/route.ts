import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const usuario_id = searchParams.get('usuario_id');

        if (!usuario_id) {
            return NextResponse.json({ error: 'usuario_id requerido' }, { status: 400 });
        }

        // Buscar la última conversación activa
        const conversacion = await prisma.conversacion.findFirst({
            where: { usuario_id },
            orderBy: { updatedAt: 'desc' },
            include: {
                mensajes: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!conversacion || conversacion.mensajes.length === 0) {
            return NextResponse.json({ success: true, hasMessages: false });
        }

        const ultimoMensaje = conversacion.mensajes[0];
        // Si el último mensaje NO es del usuario (es bot o admin), es relevante para notificación
        const esRespuesta = ultimoMensaje.remitente_id !== usuario_id;

        return NextResponse.json({
            success: true,
            hasMessages: true,
            lastMessageAt: ultimoMensaje.createdAt,
            esRespuesta
        });

    } catch (error) {
        console.error('Error obteniendo estado del chat:', error);
        return NextResponse.json(
            { error: 'Error al obtener estado' },
            { status: 500 }
        );
    }
}
