// src/app/api/eventos/route.ts
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
