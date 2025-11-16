// src/app/api/validar-qr/route.ts
import { NextResponse } from 'next/server';
import { validarHash, type QRData } from '@/lib/qr';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { qrData, staff_id } = body;

    if (!qrData) {
      return NextResponse.json(
        { error: 'No se recibió información del QR' },
        { status: 400 }
      );
    }

    let parsedData: QRData;
    
    if (typeof qrData === 'string') {
      try {
        parsedData = JSON.parse(qrData);
      } catch {
        return NextResponse.json(
          { error: 'Código QR inválido' },
          { status: 400 }
        );
      }
    } else {
      parsedData = qrData;
    }

    const { reservaId, usuarioId, hash, eventoId } = parsedData;

    // Busca la reserva en la BD
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
      return NextResponse.json(
        {
          success: false,
          error: 'Reserva no encontrada',
          tipo: 'invalido',
        },
        { status: 404 }
      );
    }

    // Verifica que el evento coincida
    if (reserva.evento_id !== eventoId) {
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
      return NextResponse.json(
        {
          success: false,
          error: `Reserva ${reserva.estado_reserva}`,
          tipo: 'invalido',
        },
        { status: 400 }
      );
    }

    // Verifica el hash de seguridad
    if (!validarHash(reservaId, usuarioId, hash)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Código QR inválido o falsificado',
          tipo: 'invalido',
        },
        { status: 400 }
      );
    }

    // Verifica si ya fue validado
    const credencial = reserva.credencialesAcceso[0];
    if (credencial && credencial.estado_validacion === 'validado') {
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
    const resultado = await prisma.$transaction(async (tx) => {
      // Actualiza la credencial
      const credencialActualizada = await tx.credencialAcceso.update({
        where: { id: credencial.id },
        data: {
          estado_validacion: 'validado',
          fecha_validacion: new Date(),
        },
      });

      // Crea registro de auditoría (si tienes staff_id)
      if (staff_id) {
        await tx.auditoria.create({
          data: {
            usuario_id: staff_id,
            accion: 'validar_entrada',
            tabla: 'credenciales_acceso',
            registro_id: credencial.id,
            detalles: JSON.stringify({
              reserva_id: reservaId,
              evento_id: eventoId,
              asistente: reserva.asistente.nombre,
            }),
          },
        });
      }

      return credencialActualizada;
    });

    return NextResponse.json({
      success: true,
      message: 'Entrada validada correctamente',
      data: {
        reservaId,
        eventoId,
        asistente: reserva.asistente.nombre,
        cantidad_boletos: reserva.cantidad_boletos,
        fecha_validacion: resultado.fecha_validacion,
      },
    });
  } catch (error: any) {
    console.error('Error validando QR:', error);
    return NextResponse.json(
      { error: 'Error al validar código QR' },
      { status: 500 }
    );
  }
}
