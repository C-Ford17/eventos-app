// src/app/api/eventos/[id]/stats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        reservas: {
          where: {
            estado_reserva: 'confirmada',
          },
          include: {
            credencialesAcceso: true,
          },
        },
      },
    });

    if (!evento) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Calcular estadísticas
    const totalReservas = evento.reservas.reduce(
      (sum, r) => sum + r.cantidad_boletos,
      0
    );

    const asistentesValidados = evento.reservas.filter(
      r => r.credencialesAcceso.some(c => c.estado_validacion === 'validado')
    ).reduce((sum, r) => sum + r.cantidad_boletos, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalReservas,
        asistentesValidados,
        aforoMax: evento.aforo_max,
        disponibilidad: evento.aforo_max - totalReservas,
        porcentajeValidado: totalReservas > 0 
          ? ((asistentesValidados / totalReservas) * 100).toFixed(1)
          : 0,
      },
    });
  } catch (error: any) {
    console.error('Error obteniendo stats:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
