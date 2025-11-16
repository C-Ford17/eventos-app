// src/app/api/proveedores/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');

    const where: any = {
      tipo_usuario: 'proveedor', // ✅ Cambio: usar tipo_usuario en lugar de rol
    };

    const proveedores = await prisma.usuario.findMany({
      where,
      include: {
        productosServicios: { // ✅ Cambio: usar productosServicios
          where: categoria ? {
            categoria: {
              contains: categoria,
              mode: 'insensitive',
            },
          } : undefined,
          orderBy: {
            precio_base: 'asc',
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    // Mapear datos para incluir estadísticas
    const proveedoresConStats = proveedores.map(proveedor => ({
      id: proveedor.id,
      nombre: proveedor.nombre,
      email: proveedor.email,
      telefono: proveedor.telefono || null,
      servicios: proveedor.productosServicios.map(servicio => ({
        id: servicio.id,
        nombre: servicio.nombre,
        descripcion: servicio.descripcion,
        precio: servicio.precio_base,
        disponible: servicio.disponibilidad,
        categoria: servicio.categoria,
      })),
      totalServicios: proveedor.productosServicios.length,
      serviciosDisponibles: proveedor.productosServicios.filter(s => s.disponibilidad).length,
    }));


    return NextResponse.json({
      success: true,
      proveedores: proveedoresConStats,
    });
  } catch (error: any) {
    console.error('Error obteniendo proveedores:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener proveedores' },
      { status: 500 }
    );
  }
}
