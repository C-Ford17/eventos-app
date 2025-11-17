import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mp_collection_id = searchParams.get('mp_collection_id');

    if (!mp_collection_id) {
      return NextResponse.json(
        { error: 'mp_collection_id es requerido' },
        { status: 400 }
      );
    }

    // Busca el pago registrado con ese ID externo y retorna la reserva asociada
    const pago = await prisma.pago.findFirst({
      where: {
        referencia_externa: mp_collection_id, // O cambia esto según cómo se almacene tu referencia.
      },
      include: {
        reserva: {
          include: {
            evento: true,
            asistente: { select: { id: true, nombre: true, email: true } },
            credencialesAcceso: true,
            pagos: true,
          },
        },
      },
    });

    if (!pago || !pago.reserva) {
      return NextResponse.json(
        { error: 'No se encontró reserva para ese pago' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reserva: pago.reserva,
    });
  } catch (error: any) {
    console.error('Error buscando reserva por collection_id:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}
