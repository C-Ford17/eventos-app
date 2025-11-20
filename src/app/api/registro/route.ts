// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Datos recibidos:', body);

    const { nombre, email, password, tipo_usuario } = body; // Ahora recibe tipo_usuario

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Valida que el tipo de usuario sea válido
    const tiposValidos = ['asistente', 'organizador', 'proveedor', 'staff'];
    const tipoFinal = tiposValidos.includes(tipo_usuario) ? tipo_usuario : 'asistente';

    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo ya está registrado' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        tipo_usuario: tipoFinal, // Usa el tipo seleccionado
        eventoStaffId: tipoFinal === 'staff' ? body.evento_id : undefined, // ✅ Asignar evento si es staff
      },
    });

    return NextResponse.json(
      {
        message: 'Usuario creado exitosamente',
        userId: user.id
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error completo en registro:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
