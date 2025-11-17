import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para agrupar entradas en backend (puede ir dentro del handler GET)
function agruparEntradas(credenciales: any[], cantidadBoletos: number) {
  if (!credenciales || credenciales.length === 0) {
    return [{
      nombre: 'General',
      cantidad: cantidadBoletos || 1,
      precio: 0,
    }];
  }
  const mapEntradas = new Map<string, { nombre: string, cantidad: number }>();
  credenciales.forEach(c => {
    const tipo = c.tipo_entrada || 'General';
    if (mapEntradas.has(tipo)) {
      mapEntradas.get(tipo)!.cantidad++;
    } else {
      mapEntradas.set(tipo, { nombre: tipo, cantidad: 1 });
    }
  });
  return Array.from(mapEntradas.values());
}

// GET - Obtener detalles de una reserva
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        evento: {
          include: {
            categoria: true,
            organizador: {
              select: {
                nombre: true,
                email: true,
              }
            },
          }
        },
        asistente: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        credencialesAcceso: true,
        pagos: true,
      },
    });

    if (!reserva) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }

    // Agrupar entradas con cantidades
    const entradasAgrupadas = agruparEntradas(reserva.credencialesAcceso, reserva.cantidad_boletos);
    const precioUnitario = reserva.cantidad_boletos ? Number(reserva.precio_total) / reserva.cantidad_boletos : Number(reserva.precio_total);

    // Añadir precio unitario a cada entrada agrupada
    const entradas = entradasAgrupadas.map(e => ({ ...e, precio: precioUnitario }));

    // Construir la respuesta con nuevas entradas
    return NextResponse.json({
      success: true,
      reserva: {
        ...reserva,
        entradas,
        qrData: reserva.qr_data || null,
      },
    });
  } catch (error: any) {
    console.error('Error obteniendo reserva:', error);
    return NextResponse.json({ error: 'Error al obtener reserva' }, { status: 500 });
  }
}

// PUT - Actualizar estado de reserva
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { estado_reserva, usuario_id } = body;

    // Verifica que la reserva existe
    const reservaExistente = await prisma.reserva.findUnique({
      where: { id },
    });

    if (!reservaExistente) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    // Verifica permisos (solo el dueño puede actualizar)
    if (usuario_id && reservaExistente.asistente_id !== usuario_id) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar esta reserva' },
        { status: 403 }
      );
    }

    // Actualiza la reserva
    const reservaActualizada = await prisma.reserva.update({
      where: { id },
      data: {
        ...(estado_reserva && { estado_reserva }),
      },
      include: {
        evento: true,
        asistente: {
          select: {
            nombre: true,
            email: true,
          },
        },
      },
    });

    // Si se cancela, crear reembolso
    if (estado_reserva === 'cancelada') {
      await prisma.reembolso.create({
        data: {
          reserva_id: id,
          monto_reembolso: reservaExistente.precio_total,
          motivo: 'Cancelación por el usuario',
          estado_reembolso: 'solicitado',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Reserva actualizada exitosamente',
      reserva: reservaActualizada,
    });
  } catch (error: any) {
    console.error('Error actualizando reserva:', error);
    return NextResponse.json(
      { error: 'Error al actualizar reserva' },
      { status: 500 }
    );
  }
}
