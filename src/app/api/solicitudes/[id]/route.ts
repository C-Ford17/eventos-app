// src/app/api/solicitudes/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ params es Promise
) {
  try {
    const { id } = await context.params; // ✅ await params
    const body = await req.json();
    const { estado_contratacion, proveedor_id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de solicitud requerido' },
        { status: 400 }
      );
    }

    // Obtiene la solicitud
    const solicitud = await prisma.eventoProductoServicio.findUnique({
      where: { id },
      include: {
        productoServicio: true,
      },
    });

    if (!solicitud) {
      return NextResponse.json(
        { success: false, error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    // Validar que el proveedor tiene permiso
    if (solicitud.productoServicio.proveedor_id !== proveedor_id) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para actualizar esta solicitud' },
        { status: 403 }
      );
    }

    // Actualizar el estado
    const solicitudActualizada = await prisma.eventoProductoServicio.update({
      where: { id },
      data: {
        estado_contratacion,
      },
      include: {
        evento: {
          include: {
            organizador: true,
          },
        },
        productoServicio: true,
      },
    });

    // Si se acepta, crear notificación para el organizador
    if (estado_contratacion === 'aceptado') {
      await prisma.notificacion.create({
        data: {
          usuario_id: solicitudActualizada.evento.organizador_id,
          tipo: 'solicitud_aceptada',
          mensaje: `El proveedor "${solicitudActualizada.productoServicio.nombre}" ha aceptado tu solicitud para el evento "${solicitudActualizada.evento.nombre}"`,
          leida: false,
        },
      });
    }

    // Si se rechaza, también notificar
    if (estado_contratacion === 'rechazado') {
      await prisma.notificacion.create({
        data: {
          usuario_id: solicitudActualizada.evento.organizador_id,
          tipo: 'solicitud_rechazada',
          mensaje: `El proveedor "${solicitudActualizada.productoServicio.nombre}" ha rechazado tu solicitud para el evento "${solicitudActualizada.evento.nombre}"`,
          leida: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      solicitud: solicitudActualizada,
    });
  } catch (error: any) {
    console.error('Error actualizando solicitud:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar solicitud' },
      { status: 500 }
    );
  }
}

// ✅ También GET para obtener detalle de una solicitud
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const solicitud = await prisma.eventoProductoServicio.findUnique({
      where: { id },
      include: {
        evento: {
          include: {
            organizador: {
              select: {
                nombre: true,
                email: true,
              },
            },
          },
        },
        productoServicio: true,
      },
    });

    if (!solicitud) {
      return NextResponse.json(
        { success: false, error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      solicitud,
    });
  } catch (error: any) {
    console.error('Error obteniendo solicitud:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener solicitud' },
      { status: 500 }
    );
  }
}
