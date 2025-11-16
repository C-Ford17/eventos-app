// src/app/api/generar-qr/route.ts
import { NextResponse } from 'next/server';
import { generarQR, generarHashValidacion, type QRData } from '@/lib/qr';
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
    
    // Genera el hash de validación
    const hash = generarHashValidacion(reservaId, usuarioId);

    // Prepara los datos del QR
    const qrData: QRData = {
      reservaId,
      eventoId,
      usuarioId,
      fecha: new Date().toISOString(),
      tipo: entradas.map((e: any) => e.nombre).join(', '),
      hash,
    };

    // Genera el código QR
    const qrDataURL = await generarQR(qrData);

    return NextResponse.json({
      success: true,
      reservaId,
      qrDataURL,
      qrData,
    });
  } catch (error: any) {
    console.error('Error generando QR:', error);
    return NextResponse.json(
      { error: 'Error al generar código QR' },
      { status: 500 }
    );
  }
}
