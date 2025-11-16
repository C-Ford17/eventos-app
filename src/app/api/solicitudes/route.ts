// src/app/api/solicitudes/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar solicitudes por proveedor
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const proveedor_id = searchParams.get('proveedor_id');
    const estado = searchParams.get('estado');

    if (!proveedor_id) {
      return NextResponse.json(
        { error: 'proveedor_id es requerido' },
        { status: 400 }
      );
    }

    const solicitudes = await prisma.eventoProductoServicio.findMany({
      where: {
        productoServicio: {
          proveedor_id,
        },
        ...(estado && { estado_contratacion: estado }),
      },
      include: {
        evento: {
          select: {
            nombre: true,
            fecha_inicio: true,
            ubicacion: true,
            organizador: {
              select: {
                nombre: true,
                email: true,
              },
            },
          },
        },
        productoServicio: {
          select: {
            nombre: true,
            categoria: true,
          },
        },
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
      { error: 'Error al obtener solicitudes' },
      { status: 500 }
    );
  }
}
