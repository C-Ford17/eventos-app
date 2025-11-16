// src/app/api/eventos/[id]/actividad-reciente/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const validaciones = await prisma.credencialAcceso.findMany({
      where: {
        reserva: {
          evento_id: id,
        },
        estado_validacion: 'validado',
      },
      include: {
        reserva: {
          include: {
            asistente: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha_validacion: 'desc',
      },
      take: 10,
    });

    const actividad = validaciones.map(v => ({
      nombre: v.reserva.asistente.nombre,
      hora: v.fecha_validacion 
        ? new Date(v.fecha_validacion).toLocaleTimeString('es-ES')
        : '',
      estado: 'exitoso',
    }));

    return NextResponse.json({
      success: true,
      actividad,
    });
  } catch (error: any) {
    console.error('Error obteniendo actividad:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener actividad' },
      { status: 500 }
    );
  }
}
