// src/app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Sidebar o navbar del dashboard */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-neutral-900 p-4">
        <h2 className="text-white font-bold mb-4">Dashboard</h2>
        <nav className="space-y-2">
          <a href="/dashboard/asistente" className="block text-gray-300 hover:text-white">
            Asistente
          </a>
          <a href="/dashboard/organizador" className="block text-gray-300 hover:text-white">
            Organizador
          </a>
          <a href="/dashboard/proveedor" className="block text-gray-300 hover:text-white">
            Proveedor
          </a>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="ml-64 p-8">
        <div className="text-white">
          {children}
        </div>
      </main>
    </div>
  );
}
