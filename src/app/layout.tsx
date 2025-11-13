// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-neutral-950 text-white min-h-screen flex flex-col">
        {/* Navbar global */}
        <nav className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">EventPlatform</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="/" className="hover:underline">Inicio</a>
            <a href="/explorar" className="hover:underline">Explorar eventos</a>
            <a href="/dashboard" className="hover:underline">Dashboard</a>
          </div>
          <div className="flex gap-2">
            <a href="/login" className="px-4 py-1 bg-neutral-800 rounded text-white hover:bg-neutral-700">Iniciar Sesión</a>
            <a href="/register" className="px-4 py-1 bg-blue-600 rounded text-white hover:bg-blue-700">Registrarse</a>
          </div>
        </nav>
        {/* Zona de contenido dinámico */}
        <main className="flex-1">
          {children}
        </main>
        {/* Footer global */}
        <footer className="py-6 px-6 md:px-20 border-t border-neutral-800 text-neutral-400 text-xs flex justify-between">
          <div>© 2024 EventPlatform. Todos los derechos reservados.</div>
          <div className="flex gap-4">
            <a href="#">Términos de Servicio</a>
            <a href="#">Política de Privacidad</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
