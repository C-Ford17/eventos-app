// src/app/dashboard/organizador/eventos/[id]/reservas/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ReservasEventoPage() {
  const params = useParams();
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar evento con sus reservas
    fetch(`/api/eventos/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEvento(data.evento);
        }
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!evento) {
    return <div className="text-center py-12">Evento no encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">
        Reservas: {evento.nombre}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Total Reservas</p>
          <p className="text-3xl font-bold text-white">{evento.totalReservas}</p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Disponibles</p>
          <p className="text-3xl font-bold text-green-400">{evento.disponibilidad}</p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Ocupación</p>
          <p className="text-3xl font-bold text-white">{evento.porcentajeOcupacion}%</p>
        </div>
      </div>

      {/* Aquí puedes agregar una tabla con la lista de asistentes */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          Lista de Asistentes
        </h2>
        <p className="text-gray-400">
          Funcionalidad en desarrollo - próximamente verás la lista completa
        </p>
      </div>
    </div>
  );
}
