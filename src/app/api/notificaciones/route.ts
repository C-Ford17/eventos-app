// src/app/api/notificaciones/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const usuario_id = searchParams.get('usuario_id');
  if (!usuario_id) {
    return NextResponse.json({ success: false, error: 'usuario_id requerido' }, { status: 400 });
  }

  const notificaciones = await prisma.notificacion.findMany({
    where: { usuario_id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, notificaciones });
}

export async function PUT(req: Request) {
  // Marcar todas como leídas para el usuario actual
  const { usuario_id } = await req.json();
  await prisma.notificacion.updateMany({
    where: { usuario_id, leida: false },
    data: { leida: true },
  });
  return NextResponse.json({ success: true });
}
