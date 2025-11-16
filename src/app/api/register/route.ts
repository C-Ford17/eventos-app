import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Datos recibidos:', body); // Para debugging
    const { nombre, email, password } = body
    // Validación explícita
    if (!nombre || !email || !password) {
      return NextResponse.json(
        { 
          error: 'Faltan campos requeridos',
          received: { nombre: !!nombre, email: !!email, password: !!password }
        },
        { status: 400 }
      );
    }
    // Chequea si el usuario ya existe
    const exist = await prisma.usuario.findUnique({ where: { email } })
    if (exist) {
      return NextResponse.json({ error: 'Ya existe el usuario' }, { status: 400 })
    }
    // Hashea la contraseña
    const hashed = await hash(password, 10)
    // Crea el usuario
    await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashed,
        tipo_usuario: 'asistente', // o el rol predeterminado
      }
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Hubo un error' }, { status: 500 })
  }
}
