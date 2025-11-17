import { NextResponse } from 'next/server';
import { validarHash } from '@/lib/qr';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { qrData, staff_id, evento_id } = body;

    console.log('=== INICIO VALIDACIÓN QR ===');
    console.log('📥 Body recibido:', body);
    console.log('📦 qrData tipo:', typeof qrData);
    console.log('📦 qrData valor:', qrData);

    if (!qrData) {
      console.error('❌ No se recibió qrData');
      return NextResponse.json(
        { success: false, error: 'No se recibió información del QR' },
        { status: 400 }
      );
    }

    const reservaId = qrData; // ahora qrData es UUID simple (string)

    // Busca la reserva en la BD
    console.log('🔎 Buscando reserva:', reservaId);
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: {
        evento: true,
        asistente: {
          select: {
            nombre: true,
            email: true,
          },
        },
        credencialesAcceso: true,
      },
    });

    if (!reserva) {
      console.error('❌ Reserva no encontrada:', reservaId);
      return NextResponse.json(
        {
          success: false,
          error: 'Reserva no encontrada',
          tipo: 'invalido',
        },
        { status: 404 }
      );
    }

    console.log('✅ Reserva encontrada:', {
      id: reserva.id,
      evento: reserva.evento.nombre,
      estado: reserva.estado_reserva,
    });

    // Verifica que el evento coincida
    if (reserva.evento_id !== evento_id) {
      console.error('❌ Evento no coincide:', {
        esperado: reserva.evento_id,
        recibido: evento_id,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'El código no corresponde a este evento',
          tipo: 'invalido',
        },
        { status: 400 }
      );
    }

    // Verifica que la reserva esté confirmada
    if (reserva.estado_reserva !== 'confirmada') {
      console.error('❌ Reserva no confirmada:', reserva.estado_reserva);
      return NextResponse.json(
        {
          success: false,
          error: `Reserva ${reserva.estado_reserva}`,
          tipo: 'invalido',
        },
        { status: 400 }
      );
    }

    // No se verifica hash porque no está en QR simple; si quieres seguridad, haz en lógica separada

    // Verifica si ya fue validado
    const credencial = reserva.credencialesAcceso[0];

    if (!credencial) {
      console.error('❌ No hay credencial asociada');
      return NextResponse.json(
        {
          success: false,
          error: 'No se encontró credencial de acceso',
          tipo: 'invalido',
        },
        { status: 400 }
      );
    }

    console.log('🎫 Credencial encontrada:', {
      id: credencial.id,
      estado: credencial.estado_validacion,
    });

    if (credencial.estado_validacion === 'validado') {
      console.error('❌ Entrada ya validada:', credencial.fecha_validacion);
      return NextResponse.json(
        {
          success: false,
          error: 'Esta entrada ya fue validada anteriormente',
          tipo: 'duplicado',
          fecha_validacion: credencial.fecha_validacion,
        },
        { status: 400 }
      );
    }

    // Valida la entrada
    console.log('✅ Validando entrada...');
    const resultado = await prisma.$transaction(async (tx) => {
      const credencialActualizada = await tx.credencialAcceso.update({
        where: { id: credencial.id },
        data: {
          estado_validacion: 'validado',
          fecha_validacion: new Date(),
        },
      });

      if (staff_id) {
        await tx.auditoria.create({
          data: {
            usuario_id: staff_id,
            accion: 'validar_entrada',
            tabla: 'credenciales_acceso',
            registro_id: credencial.id,
            detalles: JSON.stringify({
              reserva_id: reservaId,
              evento_id,
              asistente: reserva.asistente.nombre,
            }),
          },
        });
      }

      return credencialActualizada;
    });

    console.log('✅ Entrada validada exitosamente');
    console.log('=== FIN VALIDACIÓN QR ===');

    return NextResponse.json({
      success: true,
      message: 'Entrada validada correctamente',
      data: {
        reservaId,
        eventoId: evento_id,
        asistente: reserva.asistente.nombre,
        cantidad_boletos: reserva.cantidad_boletos,
        fecha_validacion: resultado.fecha_validacion,
      },
    });
  } catch (error: any) {
    console.error('❌❌❌ ERROR CRÍTICO:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { success: false, error: 'Error al validar código QR' },
      { status: 500 }
    );
  }
}
