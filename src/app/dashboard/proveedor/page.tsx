// src/app/dashboard/proveedor/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProveedorPanel() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const stats = {
    solicitudesPendientes: 5,
    serviciosActivos: 12,
    ingresosDelMes: 8500000,
    calificacionPromedio: 4.8,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Panel de Proveedor
        </h1>
        <p className="text-gray-400">
          Gestiona tus servicios y solicitudes de eventos
        </p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          href="/dashboard/proveedor/solicitudes"
          className="bg-neutral-800 p-6 rounded-lg hover:bg-neutral-700 transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Solicitudes Pendientes</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.solicitudesPendientes}
              </p>
            </div>
            <div className="bg-yellow-600 p-3 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
        </Link>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Servicios Activos</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.serviciosActivos}
              </p>
            </div>
            <div className="bg-blue-600 p-3 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ingresos del Mes</p>
              <p className="text-3xl font-bold text-white mt-2">
                ${(stats.ingresosDelMes / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-green-600 p-3 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Calificación</p>
              <div className="flex items-center mt-2">
                <p className="text-3xl font-bold text-white mr-2">
                  {stats.calificacionPromedio}
                </p>
                <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solicitudes recientes */}
      <section className="bg-neutral-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Solicitudes Recientes</h2>
          <Link href="/dashboard/proveedor/solicitudes" className="text-blue-400 hover:text-blue-300 text-sm">
            Ver todas →
          </Link>
        </div>
        <div className="space-y-3">
          {[
            { evento: 'Tech Summit 2024', organizador: 'Tech Events Co.', fecha: '2024-11-01', estado: 'Pendiente' },
            { evento: 'Festival de Música', organizador: 'Music Fest SAS', fecha: '2024-11-15', estado: 'Pendiente' },
          ].map((solicitud, i) => (
            <div key={i} className="bg-neutral-900 p-4 rounded flex justify-between items-center">
              <div>
                <p className="text-white font-medium">{solicitud.evento}</p>
                <p className="text-gray-400 text-sm">{solicitud.organizador} • {solicitud.fecha}</p>
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition">
                  Aceptar
                </button>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition">
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios activos */}
      <section className="bg-neutral-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Próximos Servicios</h2>
          <Link href="/dashboard/proveedor/servicios" className="text-blue-400 hover:text-blue-300 text-sm">
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { evento: 'Concierto Rock Indie', fecha: '2024-10-30', servicio: 'Audio y Sonido' },
            { evento: 'Boda Jardín Botánico', fecha: '2024-11-05', servicio: 'Fotografía' },
          ].map((servicio, i) => (
            <div key={i} className="bg-neutral-900 p-4 rounded">
              <p className="text-white font-medium">{servicio.evento}</p>
              <p className="text-gray-400 text-sm mt-1">{servicio.servicio}</p>
              <p className="text-blue-400 text-sm mt-2">{servicio.fecha}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
