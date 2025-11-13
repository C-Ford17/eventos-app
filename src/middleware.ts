import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Define rutas protegidas
  const protectedPaths = ['/dashboard', '/admin']
  const { pathname } = request.nextUrl
  // ¿Ruta protegida?
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    const token = await getToken({ req: request })
    if (!token) {
      // Redirecciona a login si no está autenticado
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Bonus: validación de roles
    // if (pathname.startsWith('/admin') && token.tipo_usuario !== 'organizador') {
    //   return NextResponse.redirect(new URL('/', request.url))
    // }
  }
  return NextResponse.next()
}
