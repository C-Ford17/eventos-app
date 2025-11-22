// src/app/api/eventos/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createAuditLog } from '@/lib/audit';

const prisma = new PrismaClient();

// GET - Obtener detalles de un evento específico
// GET - Obtener detalles de un evento específico
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> } // ← CAMBIO: Promise
) {
  try {
    const { id } = await context.params; // ← CAMBIO: await

    const evento = await prisma.evento.findUnique({
      where: { id },
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
            estado_reserva: true,
          },
        },
        tiposEntrada: {
          select: {
            id: true,
            nombre: true,
            precio: true,
            disponible: true,
          },
        },
      },
    });

    if (!evento) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Calcula estadísticas
    const reservasConfirmadas = (evento as any).reservas.filter(
      (r: any) => r.estado_reserva === 'confirmada'
    );
    const totalReservas = reservasConfirmadas.reduce(
      (sum: number, reserva: any) => sum + reserva.cantidad_boletos,
      0
    );

    // Calcular precio mínimo de los tipos de entrada
    let precioMinimo = 0;
    if ((evento as any).tiposEntrada.length > 0) {
      const precios = (evento as any).tiposEntrada.map((t: any) => Number(t.precio));
      precioMinimo = Math.min(...precios);
    }

    const eventoConStats = {
      ...evento,
      totalReservas,
      disponibilidad: evento.aforo_max - totalReservas,
      porcentajeOcupacion: ((totalReservas / evento.aforo_max) * 100).toFixed(1),
      precio_base: precioMinimo,
    };

    return NextResponse.json({
      success: true,
      evento: eventoConStats,
    });
  } catch (error: any) {
    console.error('Error obteniendo evento:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener evento' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar evento
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> } // ← CAMBIO
) {
  try {
    const { id } = await context.params; // ← CAMBIO
    const body = await req.json();
    const {
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      ubicacion,
      aforo_max,
      estado,
      organizador_id,
      imagen_url,
      tiposEntrada, // Array de tipos de entrada a actualizar
    } = body;

    // Verifica que el evento existe
    const eventoExistente = await prisma.evento.findUnique({
      where: { id },
    });

    if (!eventoExistente) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Verifica que el usuario es el organizador del evento
    if (organizador_id && eventoExistente.organizador_id !== organizador_id) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este evento' },
        { status: 403 }
      );
    }

    // Actualiza el evento
    // Iniciar transacción para actualizar evento y tipos de entrada
    const eventoActualizado = await prisma.$transaction(async (tx) => {
      // 1. Actualizar datos básicos del evento
      const evento = await tx.evento.update({
        where: { id },
        data: {
          ...(nombre && { nombre }),
          ...(descripcion && { descripcion }),
          ...(fecha_inicio && { fecha_inicio: new Date(fecha_inicio) }),
          ...(fecha_fin && { fecha_fin: new Date(fecha_fin) }),
          ...(ubicacion && { ubicacion }),
          ...(aforo_max && { aforo_max: parseInt(aforo_max) }),
          ...(estado && { estado }),
          ...(imagen_url !== undefined && { imagen_url }), // Permitir null
        },
      });

      // 2. Actualizar tipos de entrada si se proporcionan
      if (tiposEntrada && Array.isArray(tiposEntrada)) {
        for (const tipo of tiposEntrada) {
          if (tipo.id) {
            // Actualizar existente
            await tx.tipoEntrada.update({
              where: { id: tipo.id },
              data: {
                precio: tipo.precio,
                cantidad_total: parseInt(tipo.cantidad_total),
                nombre: tipo.nombre, // Opcional: permitir cambiar nombre
              },
            });
          } else {
            // Crear nuevo (si se desea permitir agregar tipos en edición)
            await tx.tipoEntrada.create({
              data: {
                evento_id: id,
                nombre: tipo.nombre,
                precio: tipo.precio,
                cantidad_total: parseInt(tipo.cantidad_total),
                disponible: true,
              },
            });
          }
        }
      }

      return evento;
    });

    // Registrar en auditoría
    await createAuditLog({
      usuario_id: organizador_id || eventoExistente.organizador_id,
      accion: 'actualizar_evento',
      tabla: 'eventos',
      registro_id: id,
      detalles: `Evento actualizado: ${eventoActualizado.nombre}`,
    });

    // Obtener evento actualizado con relaciones para devolver
    const eventoFinal = await prisma.evento.findUnique({
      where: { id },
      include: {
        categoria: true,
        organizador: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        tiposEntrada: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      evento: eventoFinal,
    });
  } catch (error: any) {
    console.error('Error actualizando evento:', error);
    return NextResponse.json(
      { error: 'Error al actualizar evento' },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar evento (soft delete)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const organizador_id = searchParams.get('organizador_id');

    // Verifica que el evento existe
    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        reservas: {
          where: {
            estado_reserva: 'confirmada',
          },
          include: {
            asistente: {
              select: {
                id: true,
                nombre: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Verifica permisos
    if (organizador_id && evento.organizador_id !== organizador_id) {
      return NextResponse.json(
        { error: 'No tienes permisos para cancelar este evento' },
        { status: 403 }
      );
    }

    // Soft delete - cambia el estado a cancelado
    const eventoCancelado = await prisma.evento.update({
      where: { id },
      data: {
        estado: 'cancelado',
      },
    });

    // ✅ Procesar reembolsos y notificaciones para cada asistente
    for (const reserva of evento.reservas) {
      const asistente = reserva.asistente;

      // Actualizar estado de reserva a 'cancelada'
      await prisma.reserva.update({
        where: { id: reserva.id },
        data: {
          estado_reserva: 'cancelada',
        },
      });

      // Crear registro de reembolso
      await prisma.reembolso.create({
        data: {
          reserva_id: reserva.id,
          monto_reembolso: reserva.precio_total,
          estado_reembolso: 'procesado', // o 'pendiente' si es manual
          fecha_procesado: new Date(),
        },
      });

      // Crear notificación de cancelación para el asistente
      await prisma.notificacion.create({
        data: {
          usuario_id: asistente.id,
          tipo: 'cancelacion',
          mensaje: `El evento "${evento.nombre}" ha sido cancelado. Se ha procesado tu reembolso de $${Number(
            reserva.precio_total
          ).toLocaleString('es-CO')}.`,
          leida: false,
        },
      });

      // Opcional: crear otra notificación de reembolso procesado
      await prisma.notificacion.create({
        data: {
          usuario_id: asistente.id,
          tipo: 'reembolso',
          mensaje: `Tu reembolso de $${Number(reserva.precio_total).toLocaleString(
            'es-CO'
          )} ha sido procesado exitosamente.`,
          leida: false,
        },
      });

      console.log(`✅ Reembolso y notificación enviada a: ${asistente.email}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Evento cancelado exitosamente',
      evento: eventoCancelado,
      reembolsosGenerados: evento.reservas.length,
    });
  } catch (error: any) {
    console.error('Error cancelando evento:', error);
    return NextResponse.json(
      { error: 'Error al cancelar evento' },
      { status: 500 }
    );
  }
}
