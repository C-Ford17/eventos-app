// src/app/dashboard/proveedor/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProveedorPanel() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    serviciosActivos: 0,
    solicitudesPendientes: 0,
    contratacionesCompletadas: 0,
    ingresosTotales: 0,
  });
  const [solicitudesRecientes, setSolicitudesRecientes] = useState<any[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.id) return;

    setLoading(true);

    // Cargar servicios del proveedor
    Promise.all([
      fetch(`/api/servicios?proveedor_id=${user.id}`).then(res => res.json()),
      fetch(`/api/solicitudes?proveedor_id=${user.id}`).then(res => res.json()),
    ])
      .then(([serviciosData, solicitudesData]) => {
        if (serviciosData.success) {
          const serviciosActivos = serviciosData.servicios.filter(
            (s: any) => s.disponibilidad
          ).length;
          
          setStats(prev => ({
            ...prev,
            serviciosActivos,
          }));
        }

        if (solicitudesData.success) {
          const pendientes = solicitudesData.solicitudes.filter(
            (s: any) => s.estado_contratacion === 'pendiente'
          ).length;
          
          const completadas = solicitudesData.solicitudes.filter(
            (s: any) => s.estado_contratacion === 'completado'
          ).length;

          setStats(prev => ({
            ...prev,
            solicitudesPendientes: pendientes,
            contratacionesCompletadas: completadas,
          }));

          // Solicitudes recientes (últimas 5 pendientes)
          const recientes = solicitudesData.solicitudes
            .filter((s: any) => s.estado_contratacion === 'pendiente')
            .slice(0, 5);
          
          setSolicitudesRecientes(recientes);
        }
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

        <Link
          href="/dashboard/proveedor/servicios"
          className="bg-neutral-800 p-6 rounded-lg hover:bg-neutral-700 transition"
        >
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
        </Link>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Contrataciones</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.contratacionesCompletadas}
              </p>
            </div>
            <div className="bg-green-600 p-3 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/proveedor/servicios/crear"
          className="bg-blue-600 hover:bg-blue-700 p-6 rounded-lg transition flex items-center justify-center"
        >
          <div className="text-center">
            <svg className="w-8 h-8 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-white font-semibold">Crear Servicio</p>
          </div>
        </Link>
      </div>

      {/* Solicitudes recientes */}
      <section className="bg-neutral-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Solicitudes Recientes</h2>
          <Link href="/dashboard/proveedor/solicitudes" className="text-blue-400 hover:text-blue-300 text-sm">
            Ver todas →
          </Link>
        </div>
        
        {solicitudesRecientes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No tienes solicitudes pendientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {solicitudesRecientes.map((solicitud) => (
              <div key={solicitud.id} className="bg-neutral-900 p-4 rounded flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{solicitud.evento.nombre}</p>
                  <p className="text-gray-400 text-sm">
                    {solicitud.evento.organizador.nombre} • {new Date(solicitud.evento.fecha_inicio).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href="/dashboard/proveedor/solicitudes"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Servicios populares */}
      <section className="bg-neutral-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Mis Servicios</h2>
          <Link href="/dashboard/proveedor/servicios" className="text-blue-400 hover:text-blue-300 text-sm">
            Ver todos →
          </Link>
        </div>
        <div className="text-center py-8 text-gray-400">
          <p>Gestiona tus servicios desde la sección de servicios</p>
          <Link 
            href="/dashboard/proveedor/servicios/crear"
            className="text-blue-400 hover:text-blue-300 mt-2 inline-block"
          >
            Crear tu primer servicio
          </Link>
        </div>
      </section>
    </div>
  );
}
