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

export async function POST(req : any) {
  try {
    const txtBody = await req.text();
    const signature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');
    console.log('🔔 Webhook llamado!', new Date().toISOString());
    console.log('Headers:', Object.fromEntries(req.headers));
    console.log('Body:', txtBody);

    let dataId = null;
    const body = JSON.parse(txtBody);
    dataId = body.data?.id || body.id;

    // Valida firma (opcional pero recomendado)
    // if (!verifyMpSignature(signature, xRequestId, dataId)) {
    //   return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    // }

    // ACEPTA payment.created Y payment.updated
    if (body.type !== 'payment') {
      console.log('Evento ignorado:', body.type);
      return NextResponse.json({ message: 'Evento ignorado' });
    }

    console.log('✅ Webhook recibido - Tipo:', body.action, 'Payment ID:', dataId);

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
      console.error('❌ Error consultando pago:', paymentData);
      return NextResponse.json({ error: 'No se pudo consultar pago' }, { status: 500 });
    }

    const reservaId = paymentData.external_reference;
    const estadoPago = paymentData.status;
    const metodoPago = paymentData.payment_method_id;
    const paymentIdStr = String(paymentData.id);

    console.log('📦 Payment Data:', { reservaId, estadoPago, metodoPago });

    // Actualiza pago
    await prisma.pago.updateMany({
      where: { reserva_id: reservaId },
      data: {
        referencia_externa: paymentIdStr,
        metodo_pago: metodoPago,
        estado_transaccion: estadoPago
      },
    });

    // Actualiza reserva
    await prisma.reserva.update({
      where: { id: reservaId },
      data: { estado_reserva: estadoPago === 'approved' ? 'confirmada' : 'pendiente' },
    });

    console.log('✅ Reserva actualizada:', reservaId, '| Estado:', estadoPago);
    return NextResponse.json({ message: 'Webhook procesado correctamente' });
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}

