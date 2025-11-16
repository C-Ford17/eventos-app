// src/app/api/eventos/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar todos los eventos (para página de exploración)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoria = searchParams.get('categoria');
    const estado = searchParams.get('estado') || 'programado';
    const organizador_id = searchParams.get('organizador_id');
    const limit = searchParams.get('limit'); // ✅ NUEVO

    const eventos = await prisma.evento.findMany({
      where: {
        ...(categoria && { categoria_id: categoria }),
        estado,
        // ← ELIMINA O COMENTA EL FILTRO DE FECHA:
        // fecha_inicio: {
        //   gte: new Date(),
        // },
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
        fecha_inicio: 'asc',
      },
      ...(limit && { take: parseInt(limit) }), // ✅ NUEVO: Limitar resultados
    });

    // Calcula estadísticas para cada evento
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
        organizador_id: evento.organizador_id, // ← ESTO FALTABA
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
    console.error('Error obteniendo eventos:', error);
    return NextResponse.json(
      { error: 'Error al obtener eventos' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo evento
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      ubicacion,
      aforo_max,
      categoria_id,
      organizador_id,
    } = body;

    // Validaciones
    if (!nombre || !descripcion || !fecha_inicio || !ubicacion || !aforo_max || !organizador_id) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verifica que el organizador existe y es tipo organizador
    const organizador = await prisma.usuario.findUnique({
      where: { id: organizador_id },
    });

    if (!organizador || organizador.tipo_usuario !== 'organizador') {
      return NextResponse.json(
        { error: 'Usuario no válido o no es organizador' },
        { status: 403 }
      );
    }

    // Si no hay categoria_id, busca o crea una categoría por defecto
    let categoriaFinal = categoria_id;
    if (!categoriaFinal) {
      let categoriaDefault = await prisma.categoriaEvento.findUnique({
        where: { nombre: 'General' },
      });

      if (!categoriaDefault) {
        categoriaDefault = await prisma.categoriaEvento.create({
          data: {
            nombre: 'General',
            descripcion: 'Categoría general para eventos',
          },
        });
      }
      categoriaFinal = categoriaDefault.id;
    }

    // Crea el evento
    const evento = await prisma.evento.create({
      data: {
        nombre,
        descripcion,
        fecha_inicio: new Date(fecha_inicio),
        fecha_fin: fecha_fin ? new Date(fecha_fin) : new Date(fecha_inicio),
        ubicacion,
        aforo_max: parseInt(aforo_max),
        categoria_id: categoriaFinal,
        organizador_id,
        estado: 'programado',
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
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Evento creado exitosamente',
        evento,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creando evento:', error);
    return NextResponse.json(
      { error: 'Error al crear evento', details: error.message },
      { status: 500 }
    );
  }
}
