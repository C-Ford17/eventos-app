// src/app/dashboard/asistente/reservas/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReservasPage() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    const colors: any = {
      confirmada: 'bg-green-600',
      pendiente: 'bg-yellow-600',
      cancelada: 'bg-red-600',
    };
    return colors[estado] || 'bg-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Mis Reservas</h1>

      {reservas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No tienes reservas aún</p>
          <Link href="/explorar" className="text-blue-400 hover:text-blue-300">
            Explorar eventos
          </Link>
        </div>
      ) : (
        <div className="bg-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {reservas.map((reserva) => (
                <tr key={reserva.id} className="hover:bg-neutral-700">
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {reserva.evento.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {new Date(reserva.evento.fecha_inicio).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {reserva.cantidad_boletos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    ${parseFloat(reserva.precio_total).toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs text-white ${getEstadoBadge(
                        reserva.estado_reserva
                      )}`}
                    >
                      {reserva.estado_reserva}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/boletos/${reserva.id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Ver Boleto
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
