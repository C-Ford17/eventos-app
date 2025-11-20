// src/app/dashboard/organizador/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { Calendar, Users, DollarSign, Plus, TrendingUp, ArrowRight, Clock } from 'lucide-react';

export default function OrganizadorPanel() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEventos: 0,
    eventosActivos: 0,
    totalAsistentes: 0,
    ingresosTotales: 0,
    reservasTotales: 0,
    ingresosMes: 0,
  });
  const [proximosEventos, setProximosEventos] = useState<any[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user.id) return;

    // Cargar eventos del organizador
    fetch(`/api/eventos`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const misEventos = data.eventos.filter(
            (e: any) => e.organizador_id === user.id
          );

          // Calcular estadísticas
          const activos = misEventos.filter((e: any) => e.estado === 'programado').length;
          const totalReservas = misEventos.reduce(
            (sum: number, e: any) => sum + (e.boletos_vendidos ?? 0),
            0
          );

          const totalIngresos = misEventos.reduce(
            (sum: number, e: any) => sum + (e.boletos_vendidos ?? 0) * 50000, // o el cálculo real si tienes precio unitario
            0
          );

          setStats({
            totalEventos: misEventos.length,
            eventosActivos: activos,
            totalAsistentes: totalReservas,
            ingresosTotales: totalIngresos,
            reservasTotales: totalReservas,
            ingresosMes: totalIngresos,
          });

          // Próximos eventos
          const proximos = misEventos
            .filter((e: any) => new Date(e.fecha_inicio) > new Date())
            .sort((a: any, b: any) =>
              new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()
            )
            .slice(0, 5);

          setProximosEventos(proximos);
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
          Panel de Organizador
        </h1>
        <p className="text-gray-400">
          Gestiona tus eventos y analiza el rendimiento
        </p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl -mr-12 -mt-12 transition-all group-hover:bg-purple-500/20"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-400 text-sm font-medium">Eventos Activos</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.eventosActivos}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
              <Calendar size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -mr-12 -mt-12 transition-all group-hover:bg-blue-500/20"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-400 text-sm font-medium">Reservas Totales</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.reservasTotales}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-xl -mr-12 -mt-12 transition-all group-hover:bg-green-500/20"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-400 text-sm font-medium">Ingresos del Mes</p>
              <p className="text-3xl font-bold text-white mt-2">
                ${(stats.ingresosMes / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/organizador/crear"
          className="bg-blue-600 hover:bg-blue-500 p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/20 flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:rotate-90 transition-transform duration-300">
            <Plus size={24} />
          </div>
          <p className="text-white font-bold">Crear Evento</p>
        </Link>
      </div>

      {/* Mis eventos recientes */}
      <section className="bg-[#121212] border border-white/10 p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={20} />
            Próximos Eventos
          </h2>
          <Link href="/dashboard/organizador/eventos" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {proximosEventos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-gray-500" size={24} />
            </div>
            <p className="text-gray-400 mb-4">No tienes eventos próximos</p>
            <Link
              href="/dashboard/organizador/crear"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Crear tu primer evento
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {proximosEventos.map((evento) => (
              <div key={evento.id} className="group bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex flex-col items-center justify-center text-blue-400 shrink-0">
                    <span className="text-xs font-bold uppercase">{new Date(evento.fecha_inicio).toLocaleDateString('es-ES', { month: 'short' })}</span>
                    <span className="text-lg font-bold leading-none">{new Date(evento.fecha_inicio).getDate()}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">{evento.nombre}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(evento.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {evento.boletos_vendidos ?? 0} reservas
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${evento.estado === 'programado'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                  {evento.estado.charAt(0).toUpperCase() + evento.estado.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
