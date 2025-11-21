import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        // Total users
        const totalUsers = await prisma.usuario.count();

        // Total events
        const totalEvents = await prisma.evento.count();

        // Active events (programado or en_curso)
        const activeEvents = await prisma.evento.count({
            where: {
                estado: {
                    in: ['programado', 'en_curso'],
                },
            },
        });

        // Total revenue - sum of all confirmed reservations
        const revenueData = await prisma.reserva.aggregate({
            where: {
                estado_reserva: 'confirmada',
            },
            _sum: {
                precio_total: true,
            },
        });

        const totalRevenue = revenueData._sum.precio_total || 0;

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers,
                totalEvents,
                totalRevenue: Number(totalRevenue),
                activeEvents,
            },
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener estadísticas' },
            { status: 500 }
        );
    }
}
