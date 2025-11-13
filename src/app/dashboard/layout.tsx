// src/app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row">
      <nav className="w-full md:w-60 bg-gray-800 text-white flex flex-col p-4">
        <p className="text-lg mb-4 font-bold">Mi Panel</p>
        <a href="/dashboard/organizador" className="mb-2 hover:underline">Organizador</a>
        <a href="/dashboard/proveedor" className="mb-2 hover:underline">Proveedor</a>
        <a href="/dashboard/asistente" className="mb-2 hover:underline">Asistente</a>
        {/* Puedes hacer que los enlaces estén condicionados al rol aquí */}
      </nav>
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
