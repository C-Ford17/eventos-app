import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT: Marcar como leída
export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const notificacion = await prisma.notificacion.update({
            where: { id },
            data: { leida: true }
        });

        return NextResponse.json({
            success: true,
            notificacion
        });
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json(
            { success: false, error: 'Error updating notification' },
            { status: 500 }
        );
    }
}

// DELETE: Eliminar notificación
export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        await prisma.notificacion.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json(
            { success: false, error: 'Error deleting notification' },
            { status: 500 }
        );
    }
}
