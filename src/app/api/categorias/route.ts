// src/app/api/categorias/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar todas las categorías
export async function GET() {
  try {
    const categorias = await prisma.categoriaEvento.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      categorias,
    });
  } catch (error: any) {
    console.error('Error obteniendo categorías:', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva categoría
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, descripcion } = body;

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoriaEvento.create({
      data: {
        nombre,
        descripcion: descripcion || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Categoría creada exitosamente',
        categoria,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 400 }
      );
    }

    console.error('Error creando categoría:', error);
    return NextResponse.json(
      { error: 'Error al crear categoría' },
      { status: 500 }
    );
  }
}
