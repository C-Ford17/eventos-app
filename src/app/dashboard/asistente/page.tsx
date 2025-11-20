// src/app/dashboard/asistente/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Ticket, Compass, Calendar, MapPin, ArrowRight } from 'lucide-react';

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
          className="group bg-[#121212] border border-white/10 p-6 rounded-2xl hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20"></div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-400 text-sm font-medium">Mis Boletos</p>
              <p className="text-4xl font-bold text-white mt-2">
                {stats.reservasActivas}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Ticket size={24} />
            </div>
          </div>
        </Link>

        <Link
          href="/explorar"
          className="group bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl hover:shadow-xl hover:shadow-blue-600/20 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="flex items-center justify-between relative z-10 h-full">
            <div>
              <p className="text-blue-100 text-sm font-medium">Descubre más</p>
              <p className="text-2xl font-bold text-white mt-1">Explorar Eventos</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
              <Compass size={24} />
            </div>
          </div>
        </Link>
      </div>

      {/* Próximos eventos */}
      <section className="bg-[#121212] border border-white/10 p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-blue-500" size={20} />
            Próximos Eventos
          </h2>
          <Link href="/dashboard/asistente/boletos" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
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
              href="/explorar"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <Compass size={16} />
              Explorar eventos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {proximosEventos.map((reserva) => (
              <div key={reserva.id} className="group bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex flex-col items-center justify-center text-blue-400 shrink-0">
                    <span className="text-xs font-bold uppercase">{new Date(reserva.evento.fecha_inicio).toLocaleDateString('es-ES', { month: 'short' })}</span>
                    <span className="text-lg font-bold leading-none">{new Date(reserva.evento.fecha_inicio).getDate()}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">{reserva.evento.nombre}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {reserva.evento.ubicacion}
                      </span>
                      <span className="flex items-center gap-1">
                        <Ticket size={12} />
                        {reserva.cantidad_boletos} boletos
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/boletos/${reserva.id}`}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors text-center"
                >
                  Ver boleto
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
