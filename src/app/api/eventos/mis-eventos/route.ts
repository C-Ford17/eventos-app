// src/app/api/eventos/mis-eventos/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizador_id = searchParams.get('organizador_id');

    if (!organizador_id) {
      return NextResponse.json(
        { success: false, error: 'organizador_id es requerido' },
        { status: 400 }
      );
    }

    const eventos = await prisma.evento.findMany({
      where: {
        organizador_id, // Sin filtro de fecha
      },
      include: {
        categoria: true,
        organizador: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        reservas: {
          select: {
            cantidad_boletos: true,
          },
        },
      },
      orderBy: {
        fecha_inicio: 'desc',
      },
    });

    const eventosConStats = eventos.map((evento) => {
      const totalReservas = evento.reservas.reduce(
        (sum, reserva) => sum + reserva.cantidad_boletos,
        0
      );

      const disponibilidad = evento.aforo_max - totalReservas;
      const porcentajeOcupacion = evento.aforo_max > 0 
        ? Math.round((totalReservas / evento.aforo_max) * 100) 
        : 0;

      return {
        id: evento.id,
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        fecha_inicio: evento.fecha_inicio,
        fecha_fin: evento.fecha_fin,
        ubicacion: evento.ubicacion,
        aforo_max: evento.aforo_max,
        categoria: evento.categoria.nombre,
        categoria_id: evento.categoria_id,
        organizador: evento.organizador.nombre,
        organizador_id: evento.organizador_id,
        estado: evento.estado,
        reservas: totalReservas,
        disponibilidad,
        porcentajeOcupacion,
      };
    });

    return NextResponse.json({
      success: true,
      eventos: eventosConStats,
    });
  } catch (error: any) {
    console.error('Error obteniendo mis eventos:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener eventos' },
      { status: 500 }
    );
  }
}
