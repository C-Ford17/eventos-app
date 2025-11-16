// src/app/api/organizador/servicios-contratados/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizador_id = searchParams.get('organizador_id');
    const estado = searchParams.get('estado');

    if (!organizador_id) {
      return NextResponse.json(
        { success: false, error: 'organizador_id requerido' },
        { status: 400 }
      );
    }

    const where: any = {
      evento: {
        organizador_id,
      },
    };

    if (estado && estado !== 'todos') {
      where.estado_contratacion = estado;
    }

    const servicios = await prisma.eventoProductoServicio.findMany({
      where,
      include: {
        evento: {
          select: {
            id: true,
            nombre: true,
            fecha_inicio: true,
            ubicacion: true,
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

    // Agrupar por evento
    const serviciosPorEvento = servicios.reduce((acc: any, servicio) => {
      const eventoId = servicio.evento_id;
      if (!acc[eventoId]) {
        acc[eventoId] = {
          evento: servicio.evento,
          servicios: [],
          totalServicios: 0,
          costoTotal: 0,
        };
      }
      acc[eventoId].servicios.push(servicio);
      acc[eventoId].totalServicios++;
      acc[eventoId].costoTotal += Number(servicio.precio_acordado);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      servicios,
      serviciosPorEvento: Object.values(serviciosPorEvento),
    });
  } catch (error: any) {
    console.error('Error obteniendo servicios contratados:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener servicios' },
      { status: 500 }
    );
  }
}
