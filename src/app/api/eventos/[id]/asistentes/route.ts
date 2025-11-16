// src/app/api/eventos/[id]/asistentes/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const reservas = await prisma.reserva.findMany({
      where: {
        evento_id: id,
        estado_reserva: 'confirmada',
      },
      include: {
        asistente: {
          select: {
            nombre: true,
            email: true,
          },
        },
        credencialesAcceso: {
          select: {
            codigo_qr: true,
            estado_validacion: true,
            fecha_validacion: true,
          },
        },
      },
      orderBy: {
        fecha_reserva: 'desc',
      },
    });

    const asistentes = reservas.map(reserva => ({
      id: reserva.id,
      nombre: reserva.asistente.nombre,
      email: reserva.asistente.email,
      cantidad_boletos: reserva.cantidad_boletos,
      codigo_qr: reserva.credencialesAcceso[0]?.codigo_qr || '',
      estado_validacion: reserva.credencialesAcceso[0]?.estado_validacion || 'pendiente',
      fecha_validacion: reserva.credencialesAcceso[0]?.fecha_validacion || null,
      precio_total: reserva.precio_total,
    }));

    return NextResponse.json({
      success: true,
      asistentes,
    });
  } catch (error: any) {
    console.error('Error obteniendo asistentes:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener asistentes' },
      { status: 500 }
    );
  }
}
