import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Login attempt:', body);

    const { email, password } = body;

    // Validación
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Busca el usuario por email
    const user = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verifica la contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verifica si el usuario está bloqueado
    if (user.bloqueado) {
      // Registrar intento de login bloqueado
      await createAuditLog({
        usuario_id: user.id,
        accion: 'intento_login_bloqueado',
        tabla: 'usuarios',
        registro_id: user.id,
        detalles: `Usuario bloqueado intentó iniciar sesión: ${email}`,
      });

      return NextResponse.json(
        { error: 'Tu cuenta ha sido bloqueada. Contacta al administrador para más información.' },
        { status: 403 }
      );
    }

    // Registrar login exitoso
    await createAuditLog({
      usuario_id: user.id,
      accion: 'login_exitoso',
      tabla: 'usuarios',
      registro_id: user.id,
      detalles: `Login exitoso desde ${email}`,
    });

    // Login exitoso - devuelve datos del usuario (sin contraseña)
    return NextResponse.json(
      {
        message: 'Login exitoso',
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          tipo_usuario: user.tipo_usuario,
          foto_perfil_url: user.foto_perfil_url,
          telefono: user.telefono,
          eventoStaffId: user.eventoStaffId // ✅ Incluir evento asignado
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión', details: error.message },
      { status: 500 }
    );
  }
}
