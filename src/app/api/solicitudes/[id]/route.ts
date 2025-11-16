// src/app/api/solicitudes/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - Actualizar estado de solicitud (aceptar/rechazar)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { estado_contratacion, proveedor_id } = body;

    if (!estado_contratacion) {
      return NextResponse.json(
        { error: 'El estado es requerido' },
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
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    // Verifica que el usuario es el proveedor del servicio
    if (proveedor_id && solicitud.productoServicio.proveedor_id !== proveedor_id) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar esta solicitud' },
        { status: 403 }
      );
    }

    const solicitudActualizada = await prisma.eventoProductoServicio.update({
      where: { id },
      data: {
        estado_contratacion,
      },
      include: {
        evento: {
          select: {
            nombre: true,
            organizador: {
              select: {
                nombre: true,
                email: true,
              },
            },
          },
        },
        productoServicio: {
          include: {
            proveedor: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    // TODO: Enviar notificación al organizador

    return NextResponse.json({
      success: true,
      message: `Solicitud ${estado_contratacion} exitosamente`,
      solicitud: solicitudActualizada,
    });
  } catch (error: any) {
    console.error('Error actualizando solicitud:', error);
    return NextResponse.json(
      { error: 'Error al actualizar solicitud' },
      { status: 500 }
    );
  }
}

// GET - Obtener detalles de solicitud
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
        productoServicio: {
          include: {
            proveedor: {
              select: {
                id: true,
                nombre: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!solicitud) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
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
      { error: 'Error al obtener solicitud' },
      { status: 500 }
    );
  }
}
