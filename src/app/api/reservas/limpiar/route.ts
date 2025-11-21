import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const usuario_id = searchParams.get('usuario_id');

        if (!usuario_id) {
            return NextResponse.json(
                { error: 'Usuario ID es requerido' },
                { status: 400 }
            );
        }

        const result = await prisma.reserva.deleteMany({
            where: {
                asistente_id: usuario_id,
                estado_reserva: 'rechazada',
            },
        });

        return NextResponse.json({
            success: true,
            message: `Se eliminaron ${result.count} reservas rechazadas`,
            count: result.count,
        });
    } catch (error) {
        console.error('Error eliminando reservas:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
