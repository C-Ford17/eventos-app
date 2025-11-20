// src/app/api/users/[userId]/profile/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener perfil de usuario
export async function GET(
    req: Request,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await context.params;

        const usuario = await prisma.usuario.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nombre: true,
                email: true,
                tipo_usuario: true,
                telefono: true,
                foto_perfil_url: true,
                preferencias_notificacion: true,
                mp_access_token: true,
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
            user: usuario,
        });
    } catch (error: any) {
        console.error('Error obteniendo perfil:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener perfil' },
            { status: 500 }
        );
    }
}

// PUT - Actualizar perfil de usuario
export async function PUT(
    req: Request,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await context.params;
        const body = await req.json();
        const { nombre, email, telefono, foto_perfil_url } = body;

        const usuarioActualizado = await prisma.usuario.update({
            where: { id: userId },
            data: {
                ...(nombre && { nombre }),
                ...(email && { email }),
                ...(telefono !== undefined && { telefono }),
                ...(foto_perfil_url !== undefined && { foto_perfil_url }),
            },
            select: {
                id: true,
                nombre: true,
                email: true,
                tipo_usuario: true,
                telefono: true,
                foto_perfil_url: true,
            },
        });

        // Actualizar localStorage del usuario
        return NextResponse.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            user: usuarioActualizado,
        });
    } catch (error: any) {
        console.error('Error actualizando perfil:', error);
        return NextResponse.json(
            { success: false, error: 'Error al actualizar perfil' },
            { status: 500 }
        );
    }
}
