import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const json = await req.json();
    console.log("❗️Reserva confirmada llamada con datos:", json);
    const { reservaId, paymentId, metodoPago, estado } = json;

    if (!reservaId || !estado) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const reservaActualizada = await prisma.reserva.update({
      where: { id: reservaId },
      data: {
        estado_reserva: estado === 'approved' ? 'confirmada' : 'pendiente'
      }
    });

    const pagosActualizados = await prisma.pago.updateMany({
      where: { reserva_id: reservaId },
      data: {
        referencia_externa: String(paymentId),
        metodo_pago: metodoPago || 'No especificado',
        estado_transaccion: estado,
      }
    });

    return NextResponse.json({ success: true, reserva: reservaActualizada, pagos: pagosActualizados });
  } catch (error : any) {
    console.error("❌ Error marcando confirmada:", error);
    return NextResponse.json({ error: 'Error al confirmar reserva', details: error.message }, { status: 500 });
  }
}
