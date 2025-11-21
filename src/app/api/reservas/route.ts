import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generarHashValidacion } from '@/lib/qr';
import QRCode from 'qrcode';
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
        credencialesAcceso: {
          include: {
            tipoEntrada: true
          }
        },
        pagos: true,
        tipoEntrada: true, // Incluir tipo de entrada principal
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
      tipo_entrada_id, // <-- NUEVO CAMPO
    } = body;

    // Validaciones - AHORA INCLUYE tipo_entrada_id
    if (!evento_id || !usuario_id || !cantidad_boletos || !metodo_pago || !total || !tipo_entrada_id) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos, incluyendo tipo_entrada_id' },
        { status: 400 }
      );
    }

    // 1. EXPIRACIÓN AUTOMÁTICA: Rechazar reservas pendientes antiguas (> 15 min)
    const quinceMinutosAtras = new Date(Date.now() - 15 * 60 * 1000);

    await prisma.reserva.updateMany({
      where: {
        estado_reserva: 'pendiente',
        fecha_reserva: {
          lt: quinceMinutosAtras,
        },
      },
      data: {
        estado_reserva: 'rechazada',
      },
    });

    // 2. Obtener evento y sus reservas activas (confirmadas + pendientes recientes)
    const evento = await prisma.evento.findUnique({
      where: { id: evento_id },
      include: {
        reservas: {
          where: {
            estado_reserva: {
              in: ['confirmada', 'pendiente'], // Contamos pendientes para bloquear cupo
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

    if (evento.estado !== 'programado') {
      return NextResponse.json(
        { error: 'El evento no está disponible para reservas' },
        { status: 400 }
      );
    }

    // Verifica que el tipo de entrada existe y pertenece al evento
    const tipoEntrada = await prisma.tipoEntrada.findUnique({
      where: { id: tipo_entrada_id },
    });

    if (!tipoEntrada || tipoEntrada.evento_id !== evento_id) {
      return NextResponse.json(
        { error: 'Tipo de entrada no válido para este evento' },
        { status: 400 }
      );
    }

    // Calcula boletos vendidos (Confirmados + Pendientes)
    const boletosOcupados = evento.reservas.reduce(
      (sum, r) => sum + r.cantidad_boletos,
      0
    );

    // Verifica disponibilidad
    if (boletosOcupados + cantidad_boletos > evento.aforo_max) {
      return NextResponse.json(
        {
          error: 'No hay suficientes boletos disponibles',
          disponibles: evento.aforo_max - boletosOcupados,
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
    const numeroOrden = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Genera ID único para la reserva
    const reservaId = uuidv4();

    // Genera hash para uso interno
    const hash = generarHashValidacion(reservaId, usuario_id);

    // Inicia transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // CREAR LA RESERVA CON tipo_entrada_id
      const reserva = await tx.reserva.create({
        data: {
          id: reservaId,
          evento_id,
          asistente_id: usuario_id,
          tipo_entrada_id: tipo_entrada_id, // <-- GUARDAR TIPO DE ENTRADA
          cantidad_boletos: parseInt(cantidad_boletos),
          precio_total: parseFloat(total),
          metodo_pago,
          estado_reserva: 'pendiente',
          fecha_reserva: new Date(),
          qr_data: reservaId,
          qr_hash: hash,
          numero_orden: numeroOrden, // <-- GUARDAR NÚMERO DE ORDEN
        },
      });

      // CREAR TANTAS CREDENCIALES COMO BOLETOS, CADA UNA CON tipo_entrada_id
      const credenciales = [];
      for (let i = 0; i < parseInt(cantidad_boletos); i++) {
        const credencial = await tx.credencialAcceso.create({
          data: {
            reserva_id: reserva.id,
            codigo_qr: `${reservaId}-${i}`, // QR único por boleto
            estado_validacion: 'pendiente',
            tipo_entrada_id: tipo_entrada_id, // <-- ASIGNAR TIPO A CADA CREDENCIAL
          },
        });
        credenciales.push(credencial);
      }

      // Registra el pago
      const pago = await tx.pago.create({
        data: {
          reserva_id: reserva.id,
          monto: parseFloat(total),
          metodo_pago,
          estado_transaccion: 'pendiente', // Cambiar a 'completada' después de confirmar pago
          referencia_externa: `PAY-${numeroOrden}`,
        },
      });

      return { reserva, credenciales, pago };
    });

    // Genera código QR con el ID de reserva
    const qrDataURL = await QRCode.toDataURL(reservaId, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Reserva creada exitosamente',
        reserva: {
          ...resultado.reserva,
          numero_orden: numeroOrden,
          qrDataURL,
          qrData: reservaId,
          credencialesAcceso: resultado.credenciales, // Incluir credenciales creadas
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
