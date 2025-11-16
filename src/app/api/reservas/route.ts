// src/app/api/reservas/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generarQR, generarHashValidacion, type QRData } from '@/lib/qr';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// GET - Listar reservas del usuario
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const usuario_id = searchParams.get('usuario_id');
    const estado = searchParams.get('estado');

    if (!usuario_id) {
      return NextResponse.json(
        { error: 'usuario_id es requerido' },
        { status: 400 }
      );
    }

    const reservas = await prisma.reserva.findMany({
      where: {
        asistente_id: usuario_id,
        ...(estado && { estado_reserva: estado }),
      },
      include: {
        evento: {
          include: {
            categoria: true,
            organizador: {
              select: {
                nombre: true,
                email: true,
              },
            },
          },
        },
        credencialesAcceso: true,
        pagos: true,
      },
      orderBy: {
        fecha_reserva: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      reservas,
    });
  } catch (error: any) {
    console.error('Error obteniendo reservas:', error);
    return NextResponse.json(
      { error: 'Error al obtener reservas' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva reserva (compra de boletos)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      evento_id,
      usuario_id,
      cantidad_boletos,
      metodo_pago,
      subtotal,
      cargo_servicio,
      total,
    } = body;

    // Validaciones
    if (!evento_id || !usuario_id || !cantidad_boletos || !metodo_pago || !total) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verifica que el evento existe y está disponible
    const evento = await prisma.evento.findUnique({
      where: { id: evento_id },
      include: {
        reservas: {
          where: {
            estado_reserva: 'confirmada',
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

    if (evento.estado !== 'programado') {
      return NextResponse.json(
        { error: 'El evento no está disponible para reservas' },
        { status: 400 }
      );
    }

    // Calcula boletos vendidos
    const boletosVendidos = evento.reservas.reduce(
      (sum, r) => sum + r.cantidad_boletos,
      0
    );

    // Verifica disponibilidad
    if (boletosVendidos + cantidad_boletos > evento.aforo_max) {
      return NextResponse.json(
        {
          error: 'No hay suficientes boletos disponibles',
          disponibles: evento.aforo_max - boletosVendidos,
        },
        { status: 400 }
      );
    }

    // Verifica que el usuario es asistente
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuario_id },
    });

    if (!usuario || usuario.tipo_usuario !== 'asistente') {
      return NextResponse.json(
        { error: 'Solo los asistentes pueden comprar boletos' },
        { status: 403 }
      );
    }

    // Genera número de orden único
    const numeroOrden = Math.floor(Math.random() * 1000000);

    // Genera datos del QR
    const reservaId = uuidv4();
    const hash = generarHashValidacion(reservaId, usuario_id);

    const qrData: QRData = {
      reservaId,
      eventoId: evento_id,
      usuarioId: usuario_id,
      fecha: new Date().toISOString(),
      tipo: `${cantidad_boletos} boleto(s)`,
      hash,
    };

    const qrDataURL = await generarQR(qrData);

    // Inicia transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // Crea la reserva
      const reserva = await tx.reserva.create({
        data: {
          id: reservaId,
          evento_id,
          asistente_id: usuario_id,
          cantidad_boletos: parseInt(cantidad_boletos),
          precio_total: parseFloat(total),
          metodo_pago,
          estado_reserva: 'confirmada',
          fecha_reserva: new Date(),
          qr_data: JSON.stringify(qrData),
          qr_hash: hash,
        },
      });

      // Crea la credencial de acceso (QR)
      const credencial = await tx.credencialAcceso.create({
        data: {
          reserva_id: reserva.id,
          codigo_qr: reservaId,
          estado_validacion: 'pendiente',
        },
      });

      // Registra el pago
      const pago = await tx.pago.create({
        data: {
          reserva_id: reserva.id,
          monto: parseFloat(total),
          metodo_pago,
          estado_transaccion: 'completada',
          referencia_externa: `PAY-${numeroOrden}`,
        },
      });

      return { reserva, credencial, pago };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Reserva creada exitosamente',
        reserva: {
          ...resultado.reserva,
          numeroOrden,
          qrDataURL,
          qrData,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creando reserva:', error);
    return NextResponse.json(
      { error: 'Error al crear reserva', details: error.message },
      { status: 500 }
    );
  }
}
