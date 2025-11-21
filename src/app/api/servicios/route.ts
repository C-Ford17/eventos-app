// src/app/api/servicios/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar productos/servicios
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const proveedor_id = searchParams.get('proveedor_id');
    const categoria = searchParams.get('categoria');
    const disponible = searchParams.get('disponible');

    const servicios = await prisma.productoServicio.findMany({
      where: {
        ...(proveedor_id && { proveedor_id }),
        ...(categoria && { categoria }),
        ...(disponible === 'true' && { disponibilidad: true }),
        // Solo excluir bloqueados si NO es el proveedor consultando sus propios servicios
        ...(!proveedor_id && { bloqueado: false }),
      },
      include: {
        proveedor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        eventos: {
          include: {
            evento: {
              select: {
                nombre: true,
                fecha_inicio: true,
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
    console.error('Error obteniendo servicios:', error);
    return NextResponse.json(
      { error: 'Error al obtener servicios' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto/servicio
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      proveedor_id,
      nombre,
      descripcion,
      categoria,
      precio_base,
      disponibilidad = true,
    } = body;

    // Validaciones
    if (!proveedor_id || !nombre || !descripcion || !categoria || !precio_base) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verifica que el usuario es proveedor
    const proveedor = await prisma.usuario.findUnique({
      where: { id: proveedor_id },
    });

    if (!proveedor || proveedor.tipo_usuario !== 'proveedor') {
      return NextResponse.json(
        { error: 'Usuario no es proveedor válido' },
        { status: 403 }
      );
    }

    const servicio = await prisma.productoServicio.create({
      data: {
        proveedor_id,
        nombre,
        descripcion,
        categoria,
        precio_base: parseFloat(precio_base),
        disponibilidad,
      },
      include: {
        proveedor: {
          select: {
            nombre: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Servicio creado exitosamente',
        servicio,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creando servicio:', error);
    return NextResponse.json(
      { error: 'Error al crear servicio' },
      { status: 500 }
    );
  }
}
