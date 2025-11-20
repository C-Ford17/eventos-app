import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { reservaId } = await req.json();

        if (!reservaId) {
            return NextResponse.json({ error: 'reservaId es requerido' }, { status: 400 });
        }

        // Actualizar Pago
        await prisma.pago.updateMany({
            where: { reserva_id: reservaId },
            data: {
                estado_transaccion: 'rejected', // Usamos 'rejected' para ser consistentes con MercadoPago
            },
        });

        // Actualizar Reserva
        const reserva = await prisma.reserva.update({
            where: { id: reservaId },
            data: {
                estado_reserva: 'rechazada',
            },
        });

        return NextResponse.json({ success: true, message: 'Pago y reserva marcados como rechazados' });
    } catch (error) {
        console.error('Error rechazando pago:', error);
        return NextResponse.json({ error: 'Error al rechazar el pago' }, { status: 500 });
    }
}
