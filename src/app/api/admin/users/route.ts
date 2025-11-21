import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
    try {
        const users = await prisma.usuario.findMany({
            select: {
                id: true,
                nombre: true,
                email: true,
                tipo_usuario: true,
                foto_perfil_url: true,
                bloqueado: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({
            success: true,
            users,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener usuarios' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { userId, action } = await req.json();

        if (!userId || !action) {
            return NextResponse.json(
                { success: false, error: 'Datos incompletos' },
                { status: 400 }
            );
        }

        if (action === 'block' || action === 'unblock') {
            const user = await prisma.usuario.update({
                where: { id: userId },
                data: { bloqueado: action === 'block' },
                select: { id: true, nombre: true, email: true },
            });

            // Registrar acción en auditoría
            const adminId = req.headers.get('x-user-id') || 'admin';
            await createAuditLog({
                usuario_id: adminId,
                accion: action === 'block' ? 'bloquear_usuario' : 'desbloquear_usuario',
                tabla: 'usuarios',
                registro_id: userId,
                detalles: `Usuario "${user.nombre}" (${user.email}) ${action === 'block' ? 'bloqueado' : 'desbloqueado'}`,
            });

            return NextResponse.json({
                success: true,
                message: `Usuario ${action === 'block' ? 'bloqueado' : 'desbloqueado'} correctamente`,
            });
        }

        return NextResponse.json(
            { success: false, error: 'Acción no válida' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { success: false, error: 'Error al actualizar usuario' },
            { status: 500 }
        );
    }
}
