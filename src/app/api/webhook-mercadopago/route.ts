import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function verifyMpSignature(signature: any, xRequestId : any, dataId : any) {
  if (!signature || !xRequestId || !dataId) return false;

  // El header viene así: "ts=TIMESTAMP,v1=HASH"
  const parts = signature.split(',');
  let ts, hash;
  parts.forEach((part : any) => {
    const [key, value] = part.split('=');
    if (key && value) {
      if (key.trim() === 'ts') ts = value.trim();
      if (key.trim() === 'v1') hash = value.trim();
    }
  });
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) throw new Error('MercadoPago Webhook Secret no configurado');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  return expected === hash;
}

export async function POST(req: any) {
  // OJO: para validación de firma MP hay que leer el body como texto plano primero
  const txtBody = await req.text();
  // MercadoPago envía los headers:
  const signature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');
  // Si usas Next.js API routes, cambia a req.query["data.id"] si es por query, pero para body:
  let dataId = null;
  try {
    const body = JSON.parse(txtBody);
    dataId = body.data?.id || body.id;
    // Valida firma ANTES de procesar nada
    if (!verifyMpSignature(signature, xRequestId, dataId)) {
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    }

    if (body.type !== 'payment') {
      return NextResponse.json({ message: 'Evento ignorado' });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const paymentResp = await fetch(
      `https://api.mercadopago.com/v1/payments/${dataId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const paymentData = await paymentResp.json();

    if (!paymentResp.ok) {
      return NextResponse.json({ error: 'No se pudo consultar pago' }, { status: 500 });
    }

    const reservaId = paymentData.external_reference;
    const estadoPago = paymentData.status;
    const metodoPago = paymentData.payment_method_id;
    const paymentIdStr = String(paymentData.id);

    await prisma.pago.updateMany({
      where: { reserva_id: reservaId },
      data: {
        referencia_externa: paymentIdStr,
        metodo_pago: metodoPago,
        estado_transaccion: estadoPago
      },
    });
    await prisma.reserva.update({
      where: { id: reservaId },
      data: { estado_reserva: estadoPago === 'approved' ? 'confirmada' : 'pendiente' },
    });
    return NextResponse.json({ message: 'Webhook procesado correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}
