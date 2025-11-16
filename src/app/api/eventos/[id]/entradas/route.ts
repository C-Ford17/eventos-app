// src/app/api/eventos/[id]/entradas/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: evento_id } = await context.params;

    const tiposEntrada = await prisma.tipoEntrada.findMany({
      where: {
        evento_id,
        disponible: true,
      },
      orderBy: {
        precio: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      entradas: tiposEntrada,
    });
  } catch (error: any) {
    console.error('Error obteniendo entradas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener entradas' },
      { status: 500 }
    );
  }
}
