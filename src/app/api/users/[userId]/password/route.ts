// src/app/api/users/[userId]/password/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// POST - Cambiar contraseña
export async function POST(
    req: Request,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await context.params;
        const body = await req.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { success: false, error: 'Contraseñas requeridas' },
                { status: 400 }
            );
        }

        // Obtener usuario con contraseña
        const usuario = await prisma.usuario.findUnique({
            where: { id: userId },
        });

        if (!usuario) {
            return NextResponse.json(
                { success: false, error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Verificar contraseña actual
        const passwordValida = await bcrypt.compare(currentPassword, usuario.password);
        if (!passwordValida) {
            return NextResponse.json(
                { success: false, error: 'Contraseña actual incorrecta' },
                { status: 401 }
            );
        }

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await prisma.usuario.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return NextResponse.json({
            success: true,
            message: 'Contraseña actualizada exitosamente',
        });
    } catch (error: any) {
        console.error('Error cambiando contraseña:', error);
        return NextResponse.json(
            { success: false, error: 'Error al cambiar contraseña' },
            { status: 500 }
        );
    }
}
