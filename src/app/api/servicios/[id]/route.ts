// src/app/api/servicios/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createAuditLog } from '@/lib/audit';

const prisma = new PrismaClient();

// GET - Obtener servicio específico
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const servicio = await prisma.productoServicio.findUnique({
      where: { id },
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
                ubicacion: true,
              },
            },
          },
        },
      },
    });

    if (!servicio) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      servicio,
    });
  } catch (error: any) {
    console.error('Error obteniendo servicio:', error);
    return NextResponse.json(
      { error: 'Error al obtener servicio' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar servicio
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const {
      nombre,
      descripcion,
      categoria,
      precio_base,
      disponibilidad,
      proveedor_id,
      imagen_url,
    } = body;

    // Verifica que existe
    const servicioExistente = await prisma.productoServicio.findUnique({
      where: { id },
    });

    if (!servicioExistente) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      );
    }

    // Verifica permisos
    if (proveedor_id && servicioExistente.proveedor_id !== proveedor_id) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este servicio' },
        { status: 403 }
      );
    }

    const servicioActualizado = await prisma.productoServicio.update({
      where: { id },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion && { descripcion }),
        ...(categoria && { categoria }),
        ...(precio_base && { precio_base: parseFloat(precio_base) }),
        ...(disponibilidad !== undefined && { disponibilidad }),
        ...(imagen_url !== undefined && { imagen_url }),
      },
    });

    // Registrar en auditoría
    await createAuditLog({
      usuario_id: proveedor_id || servicioExistente.proveedor_id,
      accion: 'actualizar_servicio',
      tabla: 'productos_servicios',
      registro_id: id,
      detalles: `Servicio actualizado: ${servicioActualizado.nombre}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      servicio: servicioActualizado,
    });
  } catch (error: any) {
    console.error('Error actualizando servicio:', error);
    return NextResponse.json(
      { error: 'Error al actualizar servicio' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar servicio
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const proveedor_id = searchParams.get('proveedor_id');

    const servicio = await prisma.productoServicio.findUnique({
      where: { id },
    });

    if (!servicio) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      );
    }

    // Verifica permisos
    if (proveedor_id && servicio.proveedor_id !== proveedor_id) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este servicio' },
        { status: 403 }
      );
    }

    await prisma.productoServicio.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Servicio eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error eliminando servicio:', error);
    return NextResponse.json(
      { error: 'Error al eliminar servicio' },
      { status: 500 }
    );
  }
}
