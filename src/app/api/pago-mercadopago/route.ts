// /src/app/api/pago-mercadopago/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { eventoId, descripcion, monto, referencia, email } = await req.json();

  // 1. Obtener el evento y su organizador
  const { prisma } = await import('@/lib/prisma');
  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    include: { organizador: true },
  });

  if (!evento || !evento.organizador) {
    return NextResponse.json({ error: 'Evento u organizador no encontrado' }, { status: 404 });
  }

  const organizador = evento.organizador;
  const sellerAccessToken = organizador.mp_access_token;
  const appUrl = process.env.APP_URL;

  // 2. Determinar token y configuración
  // Si el organizador tiene token, usamos su cuenta y cobramos comisión
  // Si no, usamos la cuenta de la plataforma (fallback)
  const accessToken = sellerAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken || !appUrl) {
    return NextResponse.json({ error: 'Falta configurar variables de entorno o cuenta de vendedor' }, { status: 500 });
  }

  // 3. Configurar preferencia
  const preferenceData: any = {
    items: [
      {
        title: descripcion,
        quantity: 1,
        currency_id: 'COP',
        unit_price: Number(monto),
      },
    ],
    payer: { email },
    external_reference: referencia,
    back_urls: {
      success: `${appUrl}/eventos/${eventoId}/comprar/exito`,
      failure: `${appUrl}/eventos/${eventoId}/comprar/fallo`,
      pending: `${appUrl}/eventos/${eventoId}/comprar/pending`,
    },
    auto_return: 'approved',
    binary_mode: true, // Recomended for Marketplace to avoid pending payments
  };

  // Si es Marketplace (vendedor conectado), agregamos marketplace_fee
  if (sellerAccessToken) {
    // Calcular comisión (ej: 10%)
    const commissionPercentage = 0.10;
    const fee = Number(monto) * commissionPercentage;

    preferenceData.marketplace_fee = Math.round(fee * 100) / 100; // Round to 2 decimals
    preferenceData.notification_url = `${appUrl}/api/webhook-mercadopago?source_news=webhooks`; // Webhook para notificaciones
  }

  console.log('Creating Preference with:', {
    usingSellerToken: !!sellerAccessToken,
    marketplace_fee: preferenceData.marketplace_fee,
    appUrl,
    items: preferenceData.items
  });

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error MercadoPago:', data);
      return NextResponse.json({ error: 'Error creando preferencia de pago', details: data }, { status: 500 });
    }

    return NextResponse.json({ init_point: data.init_point, preference_id: data.id });
  } catch (error) {
    console.error('Error en API pago:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
