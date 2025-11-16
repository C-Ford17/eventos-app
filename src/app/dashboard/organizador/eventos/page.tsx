// src/app/dashboard/organizador/eventos/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MisEventosPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // src/app/dashboard/organizador/eventos/page.tsx
useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user.id) return;

  setLoading(true);
  
  // Llamar al endpoint específico para mis eventos
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
      // Recargar eventos
      window.location.reload();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al cancelar evento');
    }
  };

  // Filtrar eventos por estado
  const eventosFiltrados = filtroEstado === 'todos' 
    ? eventos 
    : eventos.filter(e => e.estado === filtroEstado);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Mis Eventos</h1>
        <Link
          href="/dashboard/organizador/crear"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          + Crear Evento
        </Link>
      </div>

      {/* Filtro de estado */}
      <div className="bg-neutral-800 p-4 rounded-lg">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2 bg-neutral-900 text-white rounded border border-neutral-700"
        >
          <option value="todos">Todos los estados</option>
          <option value="programado">Programados</option>
          <option value="cancelado">Cancelados</option>
          <option value="finalizado">Finalizados</option>
        </select>
      </div>

      {eventosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No tienes eventos {filtroEstado !== 'todos' ? filtroEstado + 's' : ''}</p>
          <Link
            href="/dashboard/organizador/crear"
            className="text-blue-400 hover:text-blue-300"
          >
            Crear tu primer evento
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {eventosFiltrados.map((evento) => (
            <div key={evento.id} className="bg-neutral-800 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{evento.nombre}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {new Date(evento.fecha_inicio).toLocaleDateString('es-ES')} • {evento.ubicacion}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs text-white ${
                    evento.estado === 'programado' 
                      ? 'bg-green-600' 
                      : evento.estado === 'cancelado'
                      ? 'bg-red-600'
                      : 'bg-gray-600'
                  }`}
                >
                  {evento.estado}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Reservas</p>
                  <p className="text-white font-semibold">
                    {evento.reservas || 0} / {evento.aforo_max}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Disponibilidad</p>
                  <p className="text-white font-semibold">
                    {evento.disponibilidad || evento.aforo_max} lugares
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Ocupación</p>
                  <p className="text-white font-semibold">
                    {evento.porcentajeOcupacion || 0}%
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/dashboard/organizador/eventos/${evento.id}/editar`)}
                  disabled={evento.estado !== 'programado'}
                  className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Editar
                </button>
                <button
                  onClick={() => router.push(`/dashboard/organizador/eventos/${evento.id}/reservas`)}
                  className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded transition text-sm"
                >
                  Ver Reservas
                </button>
                <button
                  onClick={() => handleCancelarEvento(evento.id)}
                  disabled={evento.estado !== 'programado'}
                  className="px-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
