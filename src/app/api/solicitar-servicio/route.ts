// src/app/api/solicitar-servicio/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { servicio_id, evento_id, organizador_id, mensaje } = body;

    // Validar que se proporcionó un evento
    if (!evento_id) {
      return NextResponse.json(
        { success: false, error: 'Debes seleccionar un evento' },
        { status: 400 }
      );
    }

    // Validar que el servicio existe y está disponible
    const servicio = await prisma.productoServicio.findUnique({
      where: { id: servicio_id },
      include: { proveedor: true },
    });

    if (!servicio) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado' },
        { status: 404 }
      );
    }

    if (!servicio.disponibilidad) {
      return NextResponse.json(
        { success: false, error: 'Servicio no disponible' },
        { status: 400 }
      );
    }

    // Validar que el evento existe y pertenece al organizador
    const evento = await prisma.evento.findUnique({
      where: { id: evento_id },
    });

    if (!evento) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    if (evento.organizador_id !== organizador_id) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para este evento' },
        { status: 403 }
      );
    }

    // ✅ Crear la solicitud en la tabla EventoProductoServicio
    const solicitud = await prisma.eventoProductoServicio.create({
      data: {
        evento_id,
        producto_servicio_id: servicio_id,
        cantidad: 1,
        precio_acordado: servicio.precio_base,
        estado_contratacion: 'pendiente',
      },
    });

    console.log('✅ Solicitud creada en BD:', solicitud);

    // ✅ Crear notificación para el proveedor
    await prisma.notificacion.create({
      data: {
        usuario_id: servicio.proveedor_id,
        tipo: 'solicitud_servicio',
        mensaje: `Nueva solicitud de "${servicio.nombre}" para el evento "${evento.nombre}". ${mensaje ? `Mensaje: ${mensaje}` : ''}`,
        leida: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud enviada correctamente',
      solicitud_id: solicitud.id,
      proveedor: {
        nombre: servicio.proveedor.nombre,
        email: servicio.proveedor.email,
      },
    });
  } catch (error: any) {
    console.error('Error enviando solicitud:', error);
    return NextResponse.json(
      { success: false, error: 'Error al enviar solicitud' },
      { status: 500 }
    );
  }
}
