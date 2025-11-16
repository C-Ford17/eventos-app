// src/app/api/eventos/[id]/reportes/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Obtener todas las reservas con validaciones
    const reservas = await prisma.reserva.findMany({
      where: {
        evento_id: id,
        estado_reserva: 'confirmada',
      },
      include: {
        credencialesAcceso: true,
        tipoEntrada: true,
      },
    });

    // Calcular estadísticas generales
    const totalReservas = reservas.reduce((sum, r) => sum + r.cantidad_boletos, 0);
    const reservasValidadas = reservas.filter(r =>
      r.credencialesAcceso.some(c => c.estado_validacion === 'validado')
    );
    const totalValidados = reservasValidadas.reduce((sum, r) => sum + r.cantidad_boletos, 0);
    const totalPendientes = totalReservas - totalValidados;
    const porcentajeValidacion = totalReservas > 0 
      ? ((totalValidados / totalReservas) * 100).toFixed(1)
      : 0;

    // Validaciones por hora
    const validacionesPorHora: { [key: string]: number } = {};
    reservasValidadas.forEach(reserva => {
      reserva.credencialesAcceso.forEach(credencial => {
        if (credencial.fecha_validacion) {
          const hora = new Date(credencial.fecha_validacion).getHours();
          const horaKey = `${hora}:00`;
          validacionesPorHora[horaKey] = (validacionesPorHora[horaKey] || 0) + 1;
        }
      });
    });

    const validacionesPorHoraArray = Object.entries(validacionesPorHora)
      .map(([hora, cantidad]) => ({ hora, cantidad }))
      .sort((a, b) => parseInt(a.hora) - parseInt(b.hora));

    // Tipos de entrada (si existen)
    const tiposEntradaMap: { [key: string]: { vendidas: number; validadas: number } } = {};
    
    reservas.forEach(reserva => {
      const tipo = reserva.tipoEntrada?.nombre || 'General';
      
      if (!tiposEntradaMap[tipo]) {
        tiposEntradaMap[tipo] = { vendidas: 0, validadas: 0 };
      }
      
      tiposEntradaMap[tipo].vendidas += reserva.cantidad_boletos;
      
      if (reserva.credencialesAcceso.some(c => c.estado_validacion === 'validado')) {
        tiposEntradaMap[tipo].validadas += reserva.cantidad_boletos;
      }
    });

    const tiposEntrada = Object.entries(tiposEntradaMap).map(([tipo, data]) => ({
      tipo,
      vendidas: data.vendidas,
      validadas: data.validadas,
      porcentaje: data.vendidas > 0 ? (data.validadas / data.vendidas) * 100 : 0,
    }));

    return NextResponse.json({
      success: true,
      reporte: {
        stats: {
          totalReservas,
          totalValidados,
          totalPendientes,
          porcentajeValidacion: parseFloat(porcentajeValidacion.toString()),
        },
        validacionesPorHora: validacionesPorHoraArray,
        tiposEntrada,
      },
    });
  } catch (error: any) {
    console.error('Error generando reporte:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar reporte' },
      { status: 500 }
    );
  }
}
