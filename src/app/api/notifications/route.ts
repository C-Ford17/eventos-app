import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Obtener notificaciones de un usuario
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        const notificaciones = await prisma.notificacion.findMany({
            where: { usuario_id: userId },
            orderBy: { createdAt: 'desc' },
            take: 20, // Limitar a las últimas 20
        });

        // Contar no leídas
        const noLeidas = await prisma.notificacion.count({
            where: {
                usuario_id: userId,
                leida: false
            }
        });

        return NextResponse.json({
            success: true,
            notificaciones,
            noLeidas
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { success: false, error: 'Error fetching notifications' },
            { status: 500 }
        );
    }
}

// POST: Crear nueva notificación
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { usuario_id, tipo, mensaje } = body;

        if (!usuario_id || !tipo || !mensaje) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const notificacion = await prisma.notificacion.create({
            data: {
                usuario_id,
                tipo,
                mensaje,
                leida: false
            }
        });

        return NextResponse.json({
            success: true,
            notificacion
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json(
            { success: false, error: 'Error creating notification' },
            { status: 500 }
        );
    }
}
