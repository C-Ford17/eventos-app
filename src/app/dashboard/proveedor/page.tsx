// src/app/dashboard/proveedor/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Briefcase, Clock, CheckCircle, Plus, ArrowRight, Calendar } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-[50vh]">
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
          className="bg-[#121212] border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-yellow-500/30 transition-all"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl -mr-12 -mt-12 transition-all group-hover:bg-yellow-500/20"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-400 text-sm font-medium">Solicitudes Pendientes</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.solicitudesPendientes}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-400">
              <Clock size={24} />
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/proveedor/servicios"
          className="bg-[#121212] border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -mr-12 -mt-12 transition-all group-hover:bg-blue-500/20"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-400 text-sm font-medium">Servicios Activos</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.serviciosActivos}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
              <Briefcase size={24} />
            </div>
          </div>
        </Link>

        <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-xl -mr-12 -mt-12 transition-all group-hover:bg-green-500/20"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-400 text-sm font-medium">Contrataciones</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.contratacionesCompletadas}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/proveedor/servicios/crear"
          className="bg-blue-600 hover:bg-blue-500 p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/20 flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:rotate-90 transition-transform duration-300">
            <Plus size={24} />
          </div>
          <p className="text-white font-bold">Crear Servicio</p>
        </Link>
      </div>

      {/* Solicitudes recientes */}
      <section className="bg-[#121212] border border-white/10 p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="text-blue-500" size={20} />
            Solicitudes Recientes
          </h2>
          <Link href="/dashboard/proveedor/solicitudes" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {solicitudesRecientes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-gray-500" size={24} />
            </div>
            <p className="text-gray-400 mb-4">No tienes solicitudes pendientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {solicitudesRecientes.map((solicitud) => (
              <div key={solicitud.id} className="group bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">{solicitud.evento.nombre}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span>{solicitud.evento.organizador.nombre}</span>
                      <span>•</span>
                      <span>{new Date(solicitud.evento.fecha_inicio).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href="/dashboard/proveedor/solicitudes"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
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
      <section className="bg-[#121212] border border-white/10 p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="text-blue-500" size={20} />
            Mis Servicios
          </h2>
          <Link href="/dashboard/proveedor/servicios" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <div className="text-center py-8 text-gray-400">
          <p>Gestiona tus servicios desde la sección de servicios</p>
          <Link
            href="/dashboard/proveedor/servicios/crear"
            className="text-blue-400 hover:text-blue-300 mt-2 inline-block font-medium"
          >
            Crear tu primer servicio
          </Link>
        </div>
      </section>
    </div>
  );
}
