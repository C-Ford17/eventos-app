// src/app/dashboard/organizador/eventos/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Edit, Eye, XCircle, Plus, Search, Filter, MoreVertical } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';

export default function MisEventosPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user.id) return;

    setLoading(true);

    fetch(`/api/eventos/mis-eventos?organizador_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEventos(data.eventos);
        }
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, []);


  const handleCancelarEvento = async (eventoId: string) => {
    if (!window.confirm('¿Estás seguro de cancelar este evento? Se procesarán reembolsos automáticamente.')) {
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`/api/eventos/${eventoId}?organizador_id=${user.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al cancelar evento');
      }

      alert('Evento cancelado exitosamente');
      window.location.reload();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al cancelar evento');
    }
  };

  // Filtrar eventos
  const eventosFiltrados = eventos.filter(e => {
    const cumpleEstado = filtroEstado === 'todos' || e.estado === filtroEstado;
    const cumpleBusqueda = e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.ubicacion.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleEstado && cumpleBusqueda;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 animate-pulse">Cargando tus eventos...</p>
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
            <Calendar className="text-blue-500" size={32} />
            Mis Eventos
          </h1>
          <p className="text-gray-400 mt-1">Gestiona y monitorea todos tus eventos</p>
        </div>
        <Link
          href="/dashboard/organizador/crear"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Crear Evento
        </Link>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-[#1a1a1a] border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar eventos..."
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
              { value: 'programado', label: 'Programados' },
              { value: 'cancelado', label: 'Cancelados' },
              { value: 'finalizado', label: 'Finalizados' }
            ]}
            value={filtroEstado}
            onChange={(value) => setFiltroEstado(value)}
            buttonClassName="pl-12"
          />
        </div>
      </div>

      {/* Lista de Eventos */}
      {eventosFiltrados.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1a1a]/40 border border-white/5 rounded-3xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No encontramos eventos</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            {busqueda || filtroEstado !== 'todos'
              ? 'Intenta ajustar tus filtros de búsqueda.'
              : 'Comienza creando tu primer evento para verlo aquí.'}
          </p>
          {(busqueda || filtroEstado !== 'todos') ? (
            <button
              onClick={() => { setBusqueda(''); setFiltroEstado('todos'); }}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Limpiar filtros
            </button>
          ) : (
            <Link
              href="/dashboard/organizador/crear"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Crear evento ahora
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {eventosFiltrados.map((evento) => (
            <div key={evento.id} className="group bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/5">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                {/* Info Principal */}
                <div className="flex-1 w-full min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${evento.estado === 'programado'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : evento.estado === 'cancelado'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}
                    >
                      {evento.estado.charAt(0).toUpperCase() + evento.estado.slice(1)}
                    </span>
                    <span className="text-gray-500 text-sm flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(evento.fecha_inicio).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors truncate">
                    {evento.nombre}
                  </h3>

                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                    <MapPin size={16} className="text-blue-500 shrink-0" />
                    <span className="truncate">{evento.ubicacion}</span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <p className="text-gray-500 text-xs mb-1">Reservas</p>
                      <div className="flex items-end gap-2">
                        <span className="text-xl font-bold text-white">{evento.reservas || 0}</span>
                        <span className="text-xs text-gray-500 mb-1">/ {evento.aforo_max}</span>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <p className="text-gray-500 text-xs mb-1">Disponibles</p>
                      <span className="text-xl font-bold text-white">{evento.disponibilidad || evento.aforo_max}</span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <p className="text-gray-500 text-xs mb-1">Ocupación</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">{evento.porcentajeOcupacion || 0}%</span>
                        <div className="w-full bg-white/10 h-1.5 rounded-full flex-1 min-w-[40px] overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${Math.min(evento.porcentajeOcupacion || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto mt-4 lg:mt-0">
                  <button
                    onClick={() => router.push(`/dashboard/organizador/eventos/${evento.id}/editar`)}
                    disabled={evento.estado !== 'programado'}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-white/5 whitespace-nowrap"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/organizador/eventos/${evento.id}/reservas`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium border border-white/5 whitespace-nowrap"
                  >
                    <Eye size={16} />
                    Reservas
                  </button>
                  <button
                    onClick={() => handleCancelarEvento(evento.id)}
                    disabled={evento.estado !== 'programado'}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/10 whitespace-nowrap"
                  >
                    <XCircle size={16} />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
