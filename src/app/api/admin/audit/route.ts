import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const logs = await prisma.auditoria.findMany({
            select: {
                id: true,
                usuario_id: true,
                accion: true,
                tabla: true,
                registro_id: true,
                detalles: true,
                createdAt: true,
                usuario: {
                    select: {
                        nombre: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 100, // Limitar a los últimos 100 registros
        });

        return NextResponse.json({
            success: true,
            logs,
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener registros de auditoría' },
            { status: 500 }
        );
    }
}
