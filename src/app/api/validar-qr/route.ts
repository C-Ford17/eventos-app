// src/app/api/validar-qr/route.ts
import { NextResponse } from 'next/server';
import { validarHash, type QRData } from '@/lib/qr';

// Simula una base de datos de QRs validados
// En producción esto estaría en tu base de datos real
const qrsValidados = new Set<string>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { qrData } = body;

    if (!qrData) {
      return NextResponse.json(
        { error: 'No se recibió información del QR' },
        { status: 400 }
      );
    }

    let parsedData: QRData;
    
    // Si viene como string, parsearlo
    if (typeof qrData === 'string') {
      try {
        parsedData = JSON.parse(qrData);
      } catch {
        return NextResponse.json(
          { error: 'Código QR inválido' },
          { status: 400 }
        );
      }
    } else {
      parsedData = qrData;
    }

    const { reservaId, usuarioId, hash, eventoId } = parsedData;

    // Verifica que el QR no haya sido usado antes
    if (qrsValidados.has(reservaId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Esta entrada ya fue validada anteriormente',
          tipo: 'duplicado',
        },
        { status: 400 }
      );
    }

    // Valida el hash de seguridad
    if (!validarHash(reservaId, usuarioId, hash)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Código QR inválido o falsificado',
          tipo: 'invalido',
        },
        { status: 400 }
      );
    }

    // Aquí deberías verificar contra tu base de datos real
    // Por ahora solo simulamos la validación

    // Marca el QR como validado
    qrsValidados.add(reservaId);

    return NextResponse.json({
      success: true,
      message: 'Entrada validada correctamente',
      data: {
        reservaId,
        eventoId,
        fecha: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error validando QR:', error);
    return NextResponse.json(
      { error: 'Error al validar código QR' },
      { status: 500 }
    );
  }
}
