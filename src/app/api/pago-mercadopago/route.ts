// /src/app/api/pago-mercadopago/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { eventoId, descripcion, monto, referencia, email } = await req.json();
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const appUrl = process.env.APP_URL; // <--- ¡Usar variable backend aquí!
  console.log('APP_URL:', process.env.APP_URL, 'eventoId:', eventoId);


  if (!accessToken || !appUrl) {
    return NextResponse.json({ error: 'Falta configurar variables de entorno' }, { status: 500 });
  }

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
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
        pending: `${appUrl}/eventos/${eventoId}/comprar/pendiente`,
      },
      auto_return: 'approved',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Error MercadoPago:', data);
    return NextResponse.json({ error: 'Error creando preferencia de pago' }, { status: 500 });
  }

  return NextResponse.json({ init_point: data.init_point, preference_id: data.id });
}
