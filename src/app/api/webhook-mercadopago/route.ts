// /src/app/api/webhook-mercadopago/route.ts
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
    const prisma = new PrismaClient();

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

    if (estadoPago === 'approved') {
      await prisma.reserva.update({
        where: { id: reservaId },
        data: { estado_reserva: 'confirmada' },
      });
    }

    return NextResponse.json({ message: 'Webhook procesado correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}
