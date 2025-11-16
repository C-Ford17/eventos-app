// src/app/dashboard/asistente/boletos/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MisBoletosPage() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('confirmada');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.id) {
      return;
    }

    const params = new URLSearchParams();
    params.append('usuario_id', user.id);
    if (filtroEstado !== 'todas') {
      params.append('estado', filtroEstado);
    }

    fetch(`/api/reservas?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReservas(data.reservas);
        }
      })
      .catch(err => console.error('Error cargando reservas:', err))
      .finally(() => setLoading(false));
  }, [filtroEstado]);

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
        <h1 className="text-3xl font-bold text-white">Mis Boletos</h1>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2 bg-neutral-800 text-white rounded border border-neutral-700"
        >
          <option value="confirmada">Confirmadas</option>
          <option value="cancelada">Canceladas</option>
          <option value="todas">Todas</option>
        </select>
      </div>

      {reservas.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <p className="text-gray-400 text-lg mb-4">No tienes boletos aún</p>
          <Link
            href="/explorar"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Explorar Eventos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reservas.map((reserva) => (
            <div key={reserva.id} className="bg-neutral-800 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {reserva.evento.nombre}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {new Date(reserva.evento.fecha_inicio).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  reserva.estado_reserva === 'confirmada' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-red-600 text-white'
                }`}>
                  {reserva.estado_reserva}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Boletos</span>
                  <span className="text-white">{reserva.cantidad_boletos}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total pagado</span>
                  <span className="text-white">${parseFloat(reserva.precio_total).toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Método de pago</span>
                  <span className="text-white">{reserva.metodo_pago}</span>
                </div>
              </div>

              {reserva.estado_reserva === 'confirmada' && (
                <Link
                  href={`/boletos/${reserva.id}`}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition block text-center"
                >
                  Ver Boleto QR
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
