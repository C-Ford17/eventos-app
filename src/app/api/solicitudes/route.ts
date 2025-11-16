// src/app/api/solicitudes/route.ts (si no existe, créala)
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const proveedor_id = searchParams.get('proveedor_id');
    const estado = searchParams.get('estado');

    if (!proveedor_id) {
      return NextResponse.json(
        { success: false, error: 'proveedor_id requerido' },
        { status: 400 }
      );
    }

    const where: any = {
      productoServicio: {
        proveedor_id,
      },
    };

    if (estado && estado !== 'todas') {
      where.estado_contratacion = estado;
    }

    const solicitudes = await prisma.eventoProductoServicio.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      solicitudes,
    });
  } catch (error: any) {
    console.error('Error obteniendo solicitudes:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener solicitudes' },
      { status: 500 }
    );
  }
}
