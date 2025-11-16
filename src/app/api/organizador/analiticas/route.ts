// src/app/api/organizador/analiticas/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizador_id = searchParams.get('organizador_id');
    const periodo = searchParams.get('periodo') || 'mes';

    if (!organizador_id) {
      return NextResponse.json(
        { success: false, error: 'organizador_id requerido' },
        { status: 400 }
      );
    }

    // Calcular fecha de inicio según el período
    const ahora = new Date();
    let fechaInicio = new Date();

    switch (periodo) {
      case 'semana':
        fechaInicio.setDate(ahora.getDate() - 7);
        break;
      case 'mes':
        fechaInicio.setMonth(ahora.getMonth() - 1);
        break;
      case 'trimestre':
        fechaInicio.setMonth(ahora.getMonth() - 3);
        break;
      case 'año':
        fechaInicio.setFullYear(ahora.getFullYear() - 1);
        break;
      default:
        fechaInicio.setMonth(ahora.getMonth() - 1);
    }

    // Obtener eventos del organizador
    const eventos = await prisma.evento.findMany({
      where: {
        organizador_id,
        createdAt: {
          gte: fechaInicio,
        },
      },
      include: {
        categoria: true,
        reservas: {
          where: {
            estado_reserva: 'confirmada',
          },
        },
      },
    });

    // Calcular estadísticas generales
    const totalReservas = eventos.reduce(
      (sum, evento) => sum + evento.reservas.length,
      0
    );

    const ingresosTotales = eventos.reduce(
      (sum, evento) =>
        sum +
        evento.reservas.reduce(
          (sumReservas, reserva) => sumReservas + Number(reserva.precio_total),
          0
        ),
      0
    );

    const totalAforo = eventos.reduce((sum, evento) => sum + evento.aforo_max, 0);
    const boletosVendidos = eventos.reduce(
      (sum, evento) =>
        sum + evento.reservas.reduce((s, r) => s + r.cantidad_boletos, 0),
      0
    );
    const tasaOcupacion = totalAforo > 0 ? (boletosVendidos / totalAforo) * 100 : 0;

    const promedioReservasPorEvento =
      eventos.length > 0 ? totalReservas / eventos.length : 0;

    // Eventos más vendidos
    const eventosMasVendidos = eventos
      .map((evento) => ({
        id: evento.id,
        nombre: evento.nombre,
        ventas: evento.reservas.length,
        ingresos: evento.reservas.reduce(
          (sum, r) => sum + Number(r.precio_total),
          0
        ),
        boletos: evento.reservas.reduce((sum, r) => sum + r.cantidad_boletos, 0),
      }))
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 5);

    // Ventas por categoría
    const ventasPorCategoriaMap: { [key: string]: { ventas: number; ingresos: number } } = {};

    eventos.forEach((evento) => {
      const categoria = evento.categoria.nombre;
      if (!ventasPorCategoriaMap[categoria]) {
        ventasPorCategoriaMap[categoria] = { ventas: 0, ingresos: 0 };
      }
      ventasPorCategoriaMap[categoria].ventas += evento.reservas.length;
      ventasPorCategoriaMap[categoria].ingresos += evento.reservas.reduce(
        (sum, r) => sum + Number(r.precio_total),
        0
      );
    });

    const ventasPorCategoria = Object.entries(ventasPorCategoriaMap).map(
      ([categoria, data]) => ({
        categoria,
        ventas: data.ventas,
        ingresos: data.ingresos,
        porcentaje: totalReservas > 0 ? (data.ventas / totalReservas) * 100 : 0,
      })
    );

    // Tendencia de ventas por día (últimos 30 días)
    const ventasPorDia: { [key: string]: number } = {};
    const hace30Dias = new Date();
    hace30Dias.setDate(ahora.getDate() - 30);

    const reservasRecientes = await prisma.reserva.findMany({
      where: {
        evento: {
          organizador_id,
        },
        fecha_reserva: {
          gte: hace30Dias,
        },
        estado_reserva: 'confirmada',
      },
      orderBy: {
        fecha_reserva: 'asc',
      },
    });

    reservasRecientes.forEach((reserva) => {
      const fecha = reserva.fecha_reserva.toISOString().split('T')[0];
      ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + 1;
    });

    const tendenciaVentas = Object.entries(ventasPorDia).map(([fecha, cantidad]) => ({
      fecha,
      cantidad,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        ventasTotales: totalReservas,
        ingresosTotales,
        tasaOcupacion: Number(tasaOcupacion.toFixed(2)),
        promedioReservasPorEvento: Number(promedioReservasPorEvento.toFixed(2)),
        totalEventos: eventos.length,
      },
      eventosMasVendidos,
      ventasPorCategoria,
      tendenciaVentas,
    });
  } catch (error: any) {
    console.error('Error obteniendo analíticas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener analíticas' },
      { status: 500 }
    );
  }
}
