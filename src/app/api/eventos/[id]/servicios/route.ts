// src/app/api/eventos/[id]/servicios/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar servicios contratados para un evento
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: evento_id } = await context.params; // Extraer correctamente el id
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');

    const servicios = await prisma.eventoProductoServicio.findMany({
      where: {
        evento_id,
        ...(estado && { estado_contratacion: estado }),
      },
      include: {
        evento: {
          select: {
            nombre: true,
            fecha_inicio: true,
            organizador: {
              select: {
                nombre: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      servicios,
    });
  } catch (error: any) {
    console.error('Error obteniendo servicios del evento:', error);
    return NextResponse.json(
      { error: 'Error al obtener servicios' },
      { status: 500 }
    );
  }
}

// POST - Solicitar servicio para un evento
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: evento_id } = await context.params;
    const body = await req.json();
    const {
      producto_servicio_id,
      cantidad = 1,
      precio_acordado,
      organizador_id,
    } = body;

    if (!producto_servicio_id || !precio_acordado) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verifica que el evento existe y pertenece al organizador
    const evento = await prisma.evento.findUnique({
      where: { id: evento_id },
    });

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    if (organizador_id && evento.organizador_id !== organizador_id) {
      return NextResponse.json(
        { error: 'No tienes permisos para solicitar servicios para este evento' },
        { status: 403 }
      );
    }

    // Verifica que el servicio existe
    const servicio = await prisma.productoServicio.findUnique({
      where: { id: producto_servicio_id },
    });

    if (!servicio) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      );
    }

    if (!servicio.disponibilidad) {
      return NextResponse.json(
        { error: 'Este servicio no está disponible' },
        { status: 400 }
      );
    }

    const solicitud = await prisma.eventoProductoServicio.create({
      data: {
        evento_id,
        producto_servicio_id,
        cantidad: parseInt(cantidad),
        precio_acordado: parseFloat(precio_acordado),
        estado_contratacion: 'pendiente',
      },
      include: {
        evento: {
          select: {
            nombre: true,
          },
        },
        productoServicio: {
          include: {
            proveedor: {
              select: {
                nombre: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // TODO: Enviar notificación al proveedor

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud de servicio enviada exitosamente',
        solicitud,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error solicitando servicio:', error);
    return NextResponse.json(
      { error: 'Error al solicitar servicio' },
      { status: 500 }
    );
  }
}
