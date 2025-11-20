// src/app/dashboard/asistente/reservas/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Ticket, Clock, Search, Filter, ArrowRight, CreditCard } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';

export default function ReservasPage() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user.id) {
      setLoading(false);
      return;
    }

    fetch(`/api/reservas?usuario_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReservas(data.reservas);
        }
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, []);

  const getEstadoBadge = (estado: string) => {
    const styles: any = {
      confirmada: 'bg-green-500/10 text-green-400 border-green-500/20',
      pendiente: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      cancelada: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return styles[estado] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const reservasFiltradas = reservas.filter(reserva => {
    const cumpleEstado = filtroEstado === 'todos' || reserva.estado_reserva === filtroEstado;
    const cumpleBusqueda = reserva.evento.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleEstado && cumpleBusqueda;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 animate-pulse">Cargando tus reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Ticket className="text-blue-500" size={32} />
            Mis Reservas
          </h1>
          <p className="text-gray-400 mt-1">Historial completo de tus compras y reservas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-[#1a1a1a] border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre del evento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-black/20 border border-white/10 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="relative md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <CustomDropdown
            options={[
              { value: 'todos', label: 'Todos los estados' },
              { value: 'confirmada', label: 'Confirmadas' },
              { value: 'pendiente', label: 'Pendientes' },
              { value: 'cancelada', label: 'Canceladas' }
            ]}
            value={filtroEstado}
            onChange={(value) => setFiltroEstado(value)}
            buttonClassName="pl-12"
          />
        </div>
      </div>

      {reservasFiltradas.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1a1a]/40 border border-white/5 rounded-3xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No encontramos reservas</h3>
          <p className="text-gray-400 mb-8">
            {busqueda || filtroEstado !== 'todos'
              ? 'Intenta ajustar tus filtros de búsqueda.'
              : 'Aún no has realizado ninguna reserva.'}
          </p>
          <Link
            href="/explorar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
          >
            Explorar eventos
            <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reservasFiltradas.map((reserva) => (
            <div key={reserva.id} className="group relative bg-[#1a1a1a]/60 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/5 flex flex-col">
              {/* Ticket Header Design */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/5">
                    <Ticket size={24} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(reserva.estado_reserva)}`}>
                    {reserva.estado_reserva.charAt(0).toUpperCase() + reserva.estado_reserva.slice(1)}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {reserva.evento.nombre}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <Calendar size={16} className="text-gray-500" />
                    {new Date(reserva.evento.fecha_inicio).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <MapPin size={16} className="text-gray-500" />
                    <span className="line-clamp-1">{reserva.evento.ubicacion}</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Boletos</span>
                    <span className="text-white font-medium">{reserva.cantidad_boletos} entradas</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total</span>
                    <span className="text-green-400 font-bold">${parseFloat(reserva.precio_total).toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>

              {/* Ticket Footer / Action */}
              <div className="p-4 border-t border-white/5 bg-white/5">
                <Link
                  href={`/boletos/${reserva.id}`}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center justify-center gap-2 group/btn"
                >
                  Ver Boleto
                  <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
