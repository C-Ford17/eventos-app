// src/app/api/proveedores/solicitudes/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const proveedor_id = searchParams.get('proveedor_id');

    if (!proveedor_id) {
      return NextResponse.json(
        { success: false, error: 'proveedor_id requerido' },
        { status: 400 }
      );
    }

    const solicitudes = await prisma.eventoProductoServicio.findMany({
      where: {
        productoServicio: {
          proveedor_id,
        },
      },
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
