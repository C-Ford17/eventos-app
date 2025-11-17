import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { generarHashValidacion } from '@/lib/qr';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventoId, usuarioId, entradas } = body;

    if (!eventoId || !usuarioId || !entradas) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Genera un ID único para la reserva
    const reservaId = uuidv4();

    // Genera el hash de validación (si lo necesitas para backend)
    const hash = generarHashValidacion(reservaId, usuarioId);

    // Ahora el QR es solo el UUID (string plano)
    const qrString = reservaId;
    const qrDataURL = await QRCode.toDataURL(qrString, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return NextResponse.json({
      success: true,
      reservaId,
      qrDataURL,
      qrData: qrString,  // QR es UUID plano
    });
  } catch (error: any) {
    console.error('Error generando QR:', error);
    return NextResponse.json(
      { error: 'Error al generar código QR' },
      { status: 500 }
    );
  }
}
