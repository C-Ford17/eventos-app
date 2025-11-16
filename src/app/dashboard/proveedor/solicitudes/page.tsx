// src/app/dashboard/proveedor/solicitudes/page.tsx
'use client';
import { useState } from 'react';

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([
    {
      id: 1,
      evento: 'Tech Summit 2024',
      organizador: 'Tech Events Co.',
      fecha: '2024-11-01',
      lugar: 'Centro de Convenciones',
      tipoServicio: 'Audio y Sonido',
      presupuesto: 2500000,
      descripcion: 'Necesitamos sistema de sonido profesional para 200 personas',
      estado: 'Pendiente',
    },
    {
      id: 2,
      evento: 'Festival de Música',
      organizador: 'Music Fest SAS',
      fecha: '2024-11-15',
      lugar: 'Parque Central',
      tipoServicio: 'Iluminación',
      presupuesto: 3200000,
      descripcion: 'Iluminación escénica y efectos especiales para festival al aire libre',
      estado: 'Pendiente',
    },
    {
      id: 3,
      evento: 'Boda Jardín Botánico',
      organizador: 'María González',
      fecha: '2024-11-05',
      lugar: 'Jardín Botánico',
      tipoServicio: 'Fotografía',
      presupuesto: 1800000,
      descripcion: 'Fotografía y video de boda, 8 horas de cobertura',
      estado: 'Pendiente',
    },
  ]);

  const handleAceptar = (id: number) => {
    setSolicitudes(solicitudes.map(s => 
      s.id === id ? { ...s, estado: 'Aceptada' } : s
    ));
    alert('Solicitud aceptada. Se notificará al organizador.');
  };

  const handleRechazar = (id: number) => {
    const confirmar = window.confirm('¿Estás seguro de rechazar esta solicitud?');
    if (confirmar) {
      setSolicitudes(solicitudes.map(s => 
        s.id === id ? { ...s, estado: 'Rechazada' } : s
      ));
      alert('Solicitud rechazada.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Solicitudes de Servicio</h1>

      <div className="grid grid-cols-1 gap-6">
        {solicitudes.map((solicitud) => (
          <div key={solicitud.id} className="bg-neutral-800 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{solicitud.evento}</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Por: {solicitud.organizador}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs text-white ${
                  solicitud.estado === 'Pendiente'
                    ? 'bg-yellow-600'
                    : solicitud.estado === 'Aceptada'
                    ? 'bg-green-600'
                    : 'bg-red-600'
                }`}
              >
                {solicitud.estado}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Fecha</p>
                <p className="text-white">
                  {new Date(solicitud.fecha).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Lugar</p>
                <p className="text-white">{solicitud.lugar}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Servicio</p>
                <p className="text-white">{solicitud.tipoServicio}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Presupuesto</p>
                <p className="text-white">
                  ${solicitud.presupuesto.toLocaleString('es-CO')}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Descripción</p>
              <p className="text-gray-300">{solicitud.descripcion}</p>
            </div>

            {solicitud.estado === 'Pendiente' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleAceptar(solicitud.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
                >
                  Aceptar Solicitud
                </button>
                <button
                  onClick={() => handleRechazar(solicitud.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition"
                >
                  Rechazar
                </button>
                <button className="px-6 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded transition">
                  Ver Detalles
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
