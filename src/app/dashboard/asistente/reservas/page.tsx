// src/app/dashboard/asistente/reservas/page.tsx
'use client';

export default function ReservasPage() {
  // Datos de ejemplo - más adelante vendrán de la API
  const reservas = [
    {
      id: 1,
      evento: 'Tech Summit 2024',
      fecha: '2024-11-01',
      cantidad: 2,
      total: 150000,
      estado: 'Confirmada',
      metodoPago: 'Tarjeta de crédito',
    },
    {
      id: 2,
      evento: 'Festival de Música Electrónica',
      fecha: '2024-11-15',
      cantidad: 1,
      total: 80000,
      estado: 'Confirmada',
      metodoPago: 'PSE',
    },
    {
      id: 3,
      evento: 'Taller de Acuarela Creativa',
      fecha: '2024-10-20',
      cantidad: 1,
      total: 30000,
      estado: 'Completada',
      metodoPago: 'Efectivo',
    },
  ];

  const getEstadoBadge = (estado: string) => {
    const colors: any = {
      Confirmada: 'bg-green-600',
      Pendiente: 'bg-yellow-600',
      Completada: 'bg-blue-600',
      Cancelada: 'bg-red-600',
    };
    return colors[estado] || 'bg-gray-600';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Mis Reservas</h1>

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
                Método de Pago
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {reservas.map((reserva) => (
              <tr key={reserva.id} className="hover:bg-neutral-700">
                <td className="px-6 py-4 whitespace-nowrap text-white">
                  {reserva.evento}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {new Date(reserva.fecha).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {reserva.cantidad}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  ${reserva.total.toLocaleString('es-CO')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs text-white ${getEstadoBadge(
                      reserva.estado
                    )}`}
                  >
                    {reserva.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {reserva.metodoPago}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
