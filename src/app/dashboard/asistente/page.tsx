// src/app/dashboard/asistente/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AsistentePanel() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    reservasActivas: 0,
    proximosEventos: 0,
  });
  const [proximosEventos, setProximosEventos] = useState<any[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    
    fetch(`/api/reservas?usuario_id=${user.id}&estado=confirmada`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Filtrar solo eventos futuros
          const futuras = data.reservas.filter(
            (r: any) => new Date(r.evento.fecha_inicio) > new Date()
          );
          
          setStats({
            reservasActivas: data.reservas.length,
            proximosEventos: futuras.length,
          });
          
          setProximosEventos(futuras.slice(0, 3));
        }
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          ¡Bienvenido, {user?.nombre || 'Usuario'}!
        </h1>
        <p className="text-gray-400">
          Aquí tienes un resumen de tu actividad reciente
        </p>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/asistente/boletos"
          className="bg-neutral-800 p-6 rounded-lg hover:bg-neutral-700 transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Mis Boletos</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.reservasActivas}
              </p>
            </div>
            <div className="bg-blue-600 p-3 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/explorar"
          className="bg-blue-600 hover:bg-blue-700 p-6 rounded-lg transition flex items-center justify-center"
        >
          <div className="text-center">
            <svg className="w-8 h-8 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-white font-semibold">Explorar Eventos</p>
          </div>
        </Link>
      </div>

      {/* Próximos eventos */}
      <section className="bg-neutral-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Próximos Eventos</h2>
          <Link href="/dashboard/asistente/boletos" className="text-blue-400 hover:text-blue-300 text-sm">
            Ver todos →
          </Link>
        </div>
        
        {proximosEventos.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No tienes eventos próximos</p>
            <Link 
              href="/explorar"
              className="text-blue-400 hover:text-blue-300 mt-2 inline-block"
            >
              Explorar eventos
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {proximosEventos.map((reserva) => (
              <div key={reserva.id} className="bg-neutral-900 p-4 rounded flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{reserva.evento.nombre}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(reserva.evento.fecha_inicio).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <Link
                  href={`/boletos/${reserva.id}`}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Ver boleto →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
