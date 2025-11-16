// src/app/dashboard/proveedor/servicios/page.tsx
'use client';

export default function MisServiciosPage() {
  const servicios = [
    {
      id: 1,
      evento: 'Tech Summit 2024',
      organizador: 'Tech Events Co.',
      fecha: '2024-11-01',
      tipoServicio: 'Audio y Sonido',
      estado: 'Confirmado',
      monto: 2500000,
    },
    {
      id: 2,
      evento: 'Festival de Música Electrónica',
      organizador: 'Music Fest SAS',
      fecha: '2024-11-15',
      tipoServicio: 'Iluminación LED',
      estado: 'Confirmado',
      monto: 3200000,
    },
    {
      id: 3,
      evento: 'Boda Jardín Botánico',
      organizador: 'María González',
      fecha: '2024-11-05',
      tipoServicio: 'Fotografía y Video',
      estado: 'En Proceso',
      monto: 1800000,
    },
    {
      id: 4,
      evento: 'Conferencia Empresarial',
      organizador: 'Corp Solutions',
      fecha: '2024-10-25',
      tipoServicio: 'Catering',
      estado: 'Completado',
      monto: 4500000,
    },
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Confirmado':
        return 'bg-green-600';
      case 'En Proceso':
        return 'bg-blue-600';
      case 'Completado':
        return 'bg-gray-600';
      case 'Cancelado':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Mis Servicios</h1>

      <div className="bg-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Evento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Organizador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Servicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {servicios.map((servicio) => (
              <tr key={servicio.id} className="hover:bg-neutral-700">
                <td className="px-6 py-4 whitespace-nowrap text-white">
                  {servicio.evento}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {servicio.organizador}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {new Date(servicio.fecha).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {servicio.tipoServicio}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  ${servicio.monto.toLocaleString('es-CO')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs text-white ${getEstadoColor(
                      servicio.estado
                    )}`}
                  >
                    {servicio.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
