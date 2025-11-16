// src/app/dashboard/organizador/eventos/page.tsx (actualizado)
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MisEventosPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState([
    {
      id: 1,
      nombre: 'Tech Summit 2024',
      fecha: '2024-11-01',
      lugar: 'Centro de Convenciones',
      reservas: 150,
      aforo: 200,
      ingresos: 11250000,
      estado: 'Activo',
    },
    {
      id: 2,
      nombre: 'Festival de Música Electrónica',
      fecha: '2024-11-15',
      lugar: 'Gran Parque Urbano',
      reservas: 84,
      aforo: 500,
      ingresos: 6720000,
      estado: 'Activo',
    },
    {
      id: 3,
      nombre: 'Taller de Acuarela Creativa',
      fecha: '2024-10-20',
      lugar: 'Estudio de Arte Local',
      reservas: 12,
      aforo: 15,
      ingresos: 360000,
      estado: 'Finalizado',
    },
  ]);

  const handleCancelarEvento = (id: number, nombre: string) => {
    const confirmar = window.confirm(
      `¿Estás seguro que deseas cancelar el evento "${nombre}"?\n\nEsta acción notificará a todos los asistentes y procesará los reembolsos automáticamente.`
    );

    if (confirmar) {
      // Aquí irá la lógica de la API para cancelar
      setEventos(eventos.map(e => 
        e.id === id ? { ...e, estado: 'Cancelado' } : e
      ));
      alert('Evento cancelado exitosamente. Se notificará a los asistentes.');
    }
  };

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

      <div className="grid grid-cols-1 gap-6">
        {eventos.map((evento) => (
          <div key={evento.id} className="bg-neutral-800 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{evento.nombre}</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {new Date(evento.fecha).toLocaleDateString('es-ES')} • {evento.lugar}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs text-white ${
                  evento.estado === 'Activo' 
                    ? 'bg-green-600' 
                    : evento.estado === 'Cancelado'
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
                  {evento.reservas} / {evento.aforo}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Ocupación</p>
                <p className="text-white font-semibold">
                  {Math.round((evento.reservas / evento.aforo) * 100)}%
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Ingresos</p>
                <p className="text-white font-semibold">
                  ${(evento.ingresos / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/dashboard/organizador/eventos/${evento.id}/editar`)}
                disabled={evento.estado !== 'Activo'}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Editar
              </button>
              <button
                onClick={() => router.push(`/dashboard/organizador/eventos/${evento.id}`)}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded transition text-sm"
              >
                Ver Detalles
              </button>
              <button
                onClick={() => handleCancelarEvento(evento.id, evento.nombre)}
                disabled={evento.estado !== 'Activo'}
                className="px-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar Evento
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
