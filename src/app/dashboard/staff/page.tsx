// src/app/dashboard/staff/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStaff } from '@/contexts/StaffContext';
import EventoSelector from '@/components/EventoSelector';
import { Users, CheckCircle, Clock, BarChart3, QrCode, FileText, Activity, Calendar } from 'lucide-react';

export default function StaffPanel() {
  const { eventoSeleccionado, eventoActual } = useStaff();
  const [stats, setStats] = useState({
    totalReservas: 0,
    asistentesValidados: 0,
    pendientes: 0,
    porcentajeValidado: 0,
  });
  const [actividadReciente, setActividadReciente] = useState<any[]>([]);

  useEffect(() => {
    if (eventoSeleccionado) {
      cargarDatos();
    }
  }, [eventoSeleccionado]);

  const cargarDatos = async () => {
    try {
      // Cargar stats
      const statsRes = await fetch(`/api/eventos/${eventoSeleccionado}/stats`);
      const statsData = await statsRes.json();

      if (statsData.success) {
        setStats({
          totalReservas: statsData.stats.totalReservas,
          asistentesValidados: statsData.stats.asistentesValidados,
          pendientes: statsData.stats.totalReservas - statsData.stats.asistentesValidados,
          porcentajeValidado: parseFloat(statsData.stats.porcentajeValidado),
        });
      }

      // Cargar actividad reciente
      const actividadRes = await fetch(`/api/eventos/${eventoSeleccionado}/actividad-reciente`);
      const actividadData = await actividadRes.json();

      if (actividadData.success) {
        setActividadReciente(actividadData.actividad);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Activity className="text-blue-500" size={32} />
          Control de Acceso
        </h1>
        <p className="text-gray-400">
          Gestiona el acceso de asistentes al evento
        </p>
      </div>

      <EventoSelector />

      {eventoActual && (
        <>
          {/* Evento actual */}
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/20 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Calendar size={18} />
                  <span className="text-sm font-semibold uppercase tracking-wider">Evento Activo</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{eventoActual.nombre}</h2>
                <p className="text-gray-300 flex items-center gap-2">
                  {new Date(eventoActual.fecha_inicio).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <Link
                href="/dashboard/staff/escanear"
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1"
              >
                <QrCode size={20} />
                Escanear Entradas
              </Link>
            </div>
          </div>

          {/* Estadísticas en tiempo real */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                  <Users size={24} />
                </div>
                <span className="text-xs font-medium text-gray-500 bg-white/5 px-2 py-1 rounded-lg">Total</span>
              </div>
              <p className="text-gray-400 text-sm mb-1">Total Reservas</p>
              <p className="text-3xl font-bold text-white">{stats.totalReservas}</p>
            </div>

            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                  <CheckCircle size={24} />
                </div>
                <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
                  {stats.porcentajeValidado}%
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">Entradas Validadas</p>
              <p className="text-3xl font-bold text-white">{stats.asistentesValidados}</p>
            </div>

            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                  <Clock size={24} />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-white">{stats.pendientes}</p>
            </div>

            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                  <BarChart3 size={24} />
                </div>
                <span className="text-xs font-medium text-gray-500 bg-white/5 px-2 py-1 rounded-lg">Capacidad</span>
              </div>
              <p className="text-gray-400 text-sm mb-1">Aforo Ocupado</p>
              <p className="text-3xl font-bold text-white">
                {((stats.totalReservas / eventoActual.aforo_max) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-[#1a1a1a]/60 border border-white/10 p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity size={20} className="text-blue-500" />
              Actividad Reciente
            </h2>
            <div className="space-y-4">
              {actividadReciente.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-gray-400">No hay actividad reciente</p>
                </div>
              ) : (
                actividadReciente.map((actividad, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {actividad.estado === 'exitoso' ? (
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 border border-green-500/20">
                          <CheckCircle size={20} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 border border-red-500/20">
                          <Activity size={20} />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{actividad.nombre}</p>
                        <p className="text-gray-400 text-xs">{actividad.hora}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/dashboard/staff/asistentes"
              className="group bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Users size={28} />
                </div>
                <div>
                  <p className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">Lista de Asistentes</p>
                  <p className="text-gray-400 text-sm">Ver todos los registrados</p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/staff/reportes"
              className="group bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <FileText size={28} />
                </div>
                <div>
                  <p className="text-white font-bold text-lg group-hover:text-purple-400 transition-colors">Reportes</p>
                  <p className="text-gray-400 text-sm">Estadísticas del evento</p>
                </div>
              </div>
            </Link>
          </div>
        </>
      )}

      {!eventoActual && (
        <div className="text-center py-20 bg-[#1a1a1a]/40 border border-white/5 rounded-3xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No hay eventos disponibles</h3>
          <p className="text-gray-400">Selecciona un evento para comenzar</p>
        </div>
      )}
    </div>
  );
}
