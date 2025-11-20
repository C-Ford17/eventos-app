// src/app/api/users/[userId]/notifications/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener preferencias de notificación
export async function GET(
    req: Request,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await context.params;

        const usuario = await prisma.usuario.findUnique({
            where: { id: userId },
            select: {
                preferencias_notificacion: true,
            },
        });

        if (!usuario) {
            return NextResponse.json(
                { success: false, error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            preferences: usuario.preferencias_notificacion || {
                email_promocional: true,
                nuevos_eventos: true,
                recordatorios: true,
                actualizaciones_seguridad: true,
            },
        });
    } catch (error: any) {
        console.error('Error obteniendo preferencias:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener preferencias' },
            { status: 500 }
        );
    }
}

// PUT - Actualizar preferencias de notificación
export async function PUT(
    req: Request,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await context.params;
        const body = await req.json();

        await prisma.usuario.update({
            where: { id: userId },
            data: {
                preferencias_notificacion: body,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Preferencias actualizadas exitosamente',
        });
    } catch (error: any) {
        console.error('Error actualizando preferencias:', error);
        return NextResponse.json(
            { success: false, error: 'Error al actualizar preferencias' },
            { status: 500 }
        );
    }
}
