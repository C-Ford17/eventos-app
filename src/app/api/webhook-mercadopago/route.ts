import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.type !== 'payment') {
      return NextResponse.json({ message: 'Evento ignorado' });
    }

    const paymentId = body.data.id;
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    const paymentResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const paymentData = await paymentResp.json();

    if (!paymentResp.ok) {
      return NextResponse.json({ error: 'No se pudo consultar pago' }, { status: 500 });
    }

    const reservaId = paymentData.external_reference;
    const estadoPago = paymentData.status;
    const metodoPago = paymentData.payment_method_id; // tipo real (visa, pse, etc)
    const paymentIdStr = String(paymentData.id);

    // Actualiza el pago asociado a la reserva: referencia_externa = paymentIdStr, metodo_pago = metodoPago
    await prisma.pago.updateMany({
      where: { reserva_id: reservaId },
      data: {
        referencia_externa: paymentIdStr,
        metodo_pago: metodoPago,
        estado_transaccion: estadoPago
      },
    });

    // Actualiza el estado de la reserva según pago
    await prisma.reserva.update({
      where: { id: reservaId },
      data: { estado_reserva: estadoPago === 'approved' ? 'confirmada' : 'pendiente' },
    });

    return NextResponse.json({ message: 'Webhook procesado correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}
