import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const eventos = await prisma.evento.findMany();
  return NextResponse.json(eventos);
}

export async function POST(req: Request) {
  const body = await req.json();
  const evento = await prisma.evento.create({ data: body });
  return NextResponse.json(evento);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...data } = body;
  // id: el identificador del evento a editar
  const evento = await prisma.evento.update({ where: { id }, data });
  return NextResponse.json(evento);
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { id } = body;
  await prisma.evento.delete({ where: { id }});
  return NextResponse.json({ ok: true });
}
