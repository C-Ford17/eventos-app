import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const json = await req.json();
        console.log("❗️Reserva rechazada llamada con datos:", json);
        const { reservaId } = json;

        if (!reservaId) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        // Actualiza la reserva a rechazada
        const reservaActualizada = await prisma.reserva.update({
            where: { id: reservaId },
            data: {
                estado_reserva: 'rechazada',
            }
        });

        // Actualiza todos los pagos asociados a rejected
        const pagosActualizados = await prisma.pago.updateMany({
            where: { reserva_id: reservaId },
            data: {
                estado_transaccion: 'rejected',
            }
        });

        return NextResponse.json({
            success: true,
            reserva: reservaActualizada,
            pagos: pagosActualizados
        });
    } catch (error: any) {
        console.error("❌ Error marcando rechazada:", error);
        return NextResponse.json({
            error: 'Error al rechazar reserva',
            details: error.message
        }, { status: 500 });
    }
}
