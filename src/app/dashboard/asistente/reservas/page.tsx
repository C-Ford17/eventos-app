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
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Ticket className="text-blue-500" size={32} />
          Mis Reservas
        </h1>
        <p className="text-gray-400 mt-1">Historial completo de tus compras y reservas</p>
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
        <>
          {/* Desktop: Tabla */}
          <div className="hidden md:block bg-[#1a1a1a]/60 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Evento</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Boletos</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reservasFiltradas.map((reserva) => (
                    <tr key={reserva.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 mr-4 border border-white/10">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                              {reserva.evento.nombre}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={12} />
                              {reserva.evento.ubicacion}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {new Date(reserva.evento.fecha_inicio).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock size={12} />
                          {new Date(reserva.evento.fecha_inicio).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-medium">{reserva.cantidad_boletos}</div>
                        <div className="text-xs text-gray-500">entradas</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-400">
                          ${parseFloat(reserva.precio_total).toLocaleString('es-CO')}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <CreditCard size={10} />
                          {reserva.metodo_pago}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getEstadoBadge(reserva.estado_reserva)}`}>
                          {reserva.estado_reserva.charAt(0).toUpperCase() + reserva.estado_reserva.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/boletos/${reserva.id}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                        >
                          Ver Boleto
                          <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-4">
            {reservasFiltradas.map((reserva) => (
              <div key={reserva.id} className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 border border-white/10 shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm leading-tight">
                        {reserva.evento.nombre}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={10} />
                        <span className="truncate">{reserva.evento.ubicacion}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border shrink-0 ${getEstadoBadge(reserva.estado_reserva)}`}>
                    {reserva.estado_reserva.charAt(0).toUpperCase() + reserva.estado_reserva.slice(1)}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-500 text-xs">Fecha</p>
                    <p className="text-white font-medium">
                      {new Date(reserva.evento.fecha_inicio).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(reserva.evento.fecha_inicio).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 text-xs">Boletos</p>
                    <p className="text-white font-medium">{reserva.cantidad_boletos} entradas</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 text-xs">Total</p>
                    <p className="text-green-400 font-bold">
                      ${parseFloat(reserva.precio_total).toLocaleString('es-CO')}
                    </p>
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <CreditCard size={10} />
                      {reserva.metodo_pago}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-3 border-t border-white/10">
                  <Link
                    href={`/boletos/${reserva.id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    Ver Boleto
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
