import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const json = await req.json();
    console.log("❗️Reserva confirmada llamada con datos:", json);
    const { reservaId, paymentId, metodoPago, estado } = await req.json();

    if (!reservaId || !estado) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Actualiza el estado de la reserva
    const result = await prisma.reserva.update({
    where: { id: reservaId },
    data: { 
        estado_reserva: estado === 'approved' ? 'confirmada' : 'pendiente'
    }
    });

    // Actualiza todos los pagos asociados a esa reserva
    await prisma.pago.updateMany({
    where: { reserva_id: reservaId },
    data: {
        referencia_externa: String(paymentId),
        metodo_pago: metodoPago || 'No especificado',
        estado_transaccion: estado,
    }
    });

    return NextResponse.json({ success: true, reserva: result });
  } catch (error) {
    return NextResponse.json({ error: 'Error al confirmar reserva' }, { status: 500 });
  }
}
