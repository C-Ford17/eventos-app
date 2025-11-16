// src/app/api/eventos/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener detalles de un evento específico
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        categoria: true,
        organizador: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        reservas: {
          select: {
            cantidad_boletos: true,
            estado_reserva: true,
          },
        },
      },
    });

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Calcula estadísticas
    const reservasConfirmadas = evento.reservas.filter(
      (r) => r.estado_reserva === 'confirmada'
    );
    const totalReservas = reservasConfirmadas.reduce(
      (sum, reserva) => sum + reserva.cantidad_boletos,
      0
    );

    const eventoConStats = {
      ...evento,
      totalReservas,
      disponibilidad: evento.aforo_max - totalReservas,
      porcentajeOcupacion: ((totalReservas / evento.aforo_max) * 100).toFixed(1),
    };

    return NextResponse.json({
      success: true,
      evento: eventoConStats,
    });
  } catch (error: any) {
    console.error('Error obteniendo evento:', error);
    return NextResponse.json(
      { error: 'Error al obtener evento' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar evento
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      ubicacion,
      aforo_max,
      estado,
      organizador_id,
    } = body;

    // Verifica que el evento existe
    const eventoExistente = await prisma.evento.findUnique({
      where: { id },
    });

    if (!eventoExistente) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Verifica que el usuario es el organizador del evento
    if (organizador_id && eventoExistente.organizador_id !== organizador_id) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este evento' },
        { status: 403 }
      );
    }

    // Actualiza el evento
    const eventoActualizado = await prisma.evento.update({
      where: { id },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion && { descripcion }),
        ...(fecha_inicio && { fecha_inicio: new Date(fecha_inicio) }),
        ...(fecha_fin && { fecha_fin: new Date(fecha_fin) }),
        ...(ubicacion && { ubicacion }),
        ...(aforo_max && { aforo_max: parseInt(aforo_max) }),
        ...(estado && { estado }),
      },
      include: {
        categoria: true,
        organizador: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      evento: eventoActualizado,
    });
  } catch (error: any) {
    console.error('Error actualizando evento:', error);
    return NextResponse.json(
      { error: 'Error al actualizar evento' },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar evento (soft delete)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const organizador_id = searchParams.get('organizador_id');

    // Verifica que el evento existe
    const evento = await prisma.evento.findUnique({
      where: { id },
    });

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Verifica permisos
    if (organizador_id && evento.organizador_id !== organizador_id) {
      return NextResponse.json(
        { error: 'No tienes permisos para cancelar este evento' },
        { status: 403 }
      );
    }

    // Soft delete - cambia el estado a cancelado
    const eventoCancelado = await prisma.evento.update({
      where: { id },
      data: {
        estado: 'cancelado',
      },
    });

    // TODO: Aquí deberías procesar reembolsos automáticamente
    // y enviar notificaciones a los asistentes

    return NextResponse.json({
      success: true,
      message: 'Evento cancelado exitosamente',
      evento: eventoCancelado,
    });
  } catch (error: any) {
    console.error('Error cancelando evento:', error);
    return NextResponse.json(
      { error: 'Error al cancelar evento' },
      { status: 500 }
    );
  }
}
