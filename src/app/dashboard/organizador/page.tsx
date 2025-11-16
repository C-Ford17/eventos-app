// src/app/dashboard/organizador/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
            (sum: number, e: any) => sum + (e.reservas || 0), 
            0
          );
          const totalIngresos = misEventos.reduce(
            (sum: number, e: any) => sum + (e.reservas || 0) * 50000, // Aproximado
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
      <div className="flex items-center justify-center min-h-screen">
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
        <div className="bg-neutral-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Eventos Activos</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.eventosActivos}
              </p>
            </div>
            <div className="bg-purple-600 p-3 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Reservas Totales</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.reservasTotales}
              </p>
            </div>
            <div className="bg-blue-600 p-3 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ingresos del Mes</p>
              <p className="text-3xl font-bold text-white mt-2">
                ${(stats.ingresosMes / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-green-600 p-3 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/organizador/crear"
          className="bg-blue-600 hover:bg-blue-700 p-6 rounded-lg transition flex items-center justify-center"
        >
          <div className="text-center">
            <svg className="w-8 h-8 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-white font-semibold">Crear Evento</p>
          </div>
        </Link>
      </div>

      {/* Mis eventos recientes */}
      <section className="bg-neutral-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Próximos Eventos</h2>
          <Link href="/dashboard/organizador/eventos" className="text-blue-400 hover:text-blue-300 text-sm">
            Ver todos →
          </Link>
        </div>
        
        {proximosEventos.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No tienes eventos próximos</p>
            <Link 
              href="/dashboard/organizador/crear"
              className="text-blue-400 hover:text-blue-300 mt-2 inline-block"
            >
              Crear tu primer evento
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {proximosEventos.map((evento) => (
              <div key={evento.id} className="bg-neutral-900 p-4 rounded flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{evento.nombre}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(evento.fecha_inicio).toLocaleDateString('es-ES')} • {evento.reservas || 0} reservas
                  </p>
                </div>
                <span className={`px-3 py-1 text-white text-xs rounded-full ${
                  evento.estado === 'programado' ? 'bg-green-600' : 'bg-gray-600'
                }`}>
                  {evento.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
