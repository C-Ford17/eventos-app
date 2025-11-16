// src/app/api/tipos-entrada/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { evento_id, nombre, precio } = body;

    if (!evento_id || !nombre || !precio) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const tipoEntrada = await prisma.tipoEntrada.create({
      data: {
        evento_id,
        nombre,
        precio,
        disponible: true,
      },
    });

    return NextResponse.json({
      success: true,
      tipoEntrada,
    });
  } catch (error) {
    console.error('Error creando tipo de entrada:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear tipo de entrada' },
      { status: 500 }
    );
  }
}
