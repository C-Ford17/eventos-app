// src/app/dashboard/layout.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  // Define las opciones del sidebar según el rol
  const getSidebarOptions = () => {
    if (!user) return [];

    const commonOptions = [
      { label: 'Dashboard', href: `/dashboard/${user.tipo_usuario}` },
    ];

    switch (user.tipo_usuario) {
      case 'asistente':
        return [
          ...commonOptions,
          { label: 'Mis Reservas', href: '/dashboard/asistente/reservas' },
          { label: 'Mis Boletos', href: '/dashboard/asistente/boletos' },
          { label: 'Notificaciones', href: '/dashboard/asistente/notificaciones' },
        ];
      case 'organizador':
        return [
          ...commonOptions,
          { label: 'Mis Eventos', href: '/dashboard/organizador/eventos' },
          { label: 'Crear Evento', href: '/dashboard/organizador/crear' },
          { label: 'Analíticas', href: '/dashboard/organizador/analiticas' },
          { label: 'Proveedores', href: '/dashboard/organizador/proveedores' },
        ];
      case 'proveedor':
        return [
          ...commonOptions,
          { label: 'Mis Servicios', href: '/dashboard/proveedor/servicios' },
          { label: 'Solicitudes', href: '/dashboard/proveedor/solicitudes' },
          { label: 'Historial', href: '/dashboard/proveedor/historial' },
        ];
      case 'staff':  // NUEVO
        return [
          ...commonOptions,
          { label: 'Escanear Entradas', href: '/dashboard/staff/escanear' },
          { label: 'Lista de Asistentes', href: '/dashboard/staff/asistentes' },
          { label: 'Reportes', href: '/dashboard/staff/reportes' },
        ];
      default:
        return commonOptions;
    }
  };

  const sidebarOptions = getSidebarOptions();

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-neutral-900 p-4 border-r border-neutral-800">
        <div className="mb-8">
          <Link href="/" className="text-xl font-bold text-white">
            EventPlatform
          </Link>
        </div>

        <nav className="space-y-2">
          <div className="text-xs uppercase text-gray-500 mb-2 px-3">
            {user?.tipo_usuario || 'Dashboard'}
          </div>
          {sidebarOptions.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className={`block px-3 py-2 rounded transition-colors ${
                pathname === option.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
