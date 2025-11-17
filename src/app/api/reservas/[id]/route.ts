import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener detalles de una reserva
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        evento: {
          include: {
            categoria: true,
            organizador: {
              select: {
                nombre: true,
                email: true,
              },
            },
          },
        },
        asistente: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        credencialesAcceso: true,
        pagos: true,
      },
    });

    if (!reserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    // Ya NO parseamos qr_data. Es un string simple, úsalo como está
    const qrData = reserva.qr_data || null;

    return NextResponse.json({
      success: true,
      reserva: {
        ...reserva,
        qrData,
      },
    });
  } catch (error: any) {
    console.error('Error obteniendo reserva:', error);
    return NextResponse.json(
      { error: 'Error al obtener reserva' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar estado de reserva
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { estado_reserva, usuario_id } = body;

    // Verifica que la reserva existe
    const reservaExistente = await prisma.reserva.findUnique({
      where: { id },
    });

    if (!reservaExistente) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    // Verifica permisos (solo el dueño puede actualizar)
    if (usuario_id && reservaExistente.asistente_id !== usuario_id) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar esta reserva' },
        { status: 403 }
      );
    }

    // Actualiza la reserva
    const reservaActualizada = await prisma.reserva.update({
      where: { id },
      data: {
        ...(estado_reserva && { estado_reserva }),
      },
      include: {
        evento: true,
        asistente: {
          select: {
            nombre: true,
            email: true,
          },
        },
      },
    });

    // Si se cancela, crear reembolso
    if (estado_reserva === 'cancelada') {
      await prisma.reembolso.create({
        data: {
          reserva_id: id,
          monto_reembolso: reservaExistente.precio_total,
          motivo: 'Cancelación por el usuario',
          estado_reembolso: 'solicitado',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Reserva actualizada exitosamente',
      reserva: reservaActualizada,
    });
  } catch (error: any) {
    console.error('Error actualizando reserva:', error);
    return NextResponse.json(
      { error: 'Error al actualizar reserva' },
      { status: 500 }
    );
  }
}
