// src/components/EventoSelector.tsx
'use client';
import { useStaff } from '@/contexts/StaffContext';


export default function EventoSelector() {
  const { eventos, eventoSeleccionado, setEventoSeleccionado, eventoActual } = useStaff();

  return (
    <div className="bg-neutral-800 p-4 rounded-lg mb-6">
      <label className="block text-gray-400 text-sm mb-2">
        Evento Actual:
      </label>
      <select
        value={eventoSeleccionado}
        onChange={(e) => setEventoSeleccionado(e.target.value)}
        className="w-full px-4 py-3 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Selecciona un evento</option>
        {eventos.map(evento => (
          <option key={evento.id} value={evento.id}>
            {evento.nombre} - {new Date(evento.fecha_inicio).toLocaleDateString('es-ES')}
          </option>
        ))}
      </select>
      
      {eventoActual && (
        <div className="mt-3 text-sm text-gray-400">
          📍 {eventoActual.ubicacion} • Aforo: {eventoActual.aforo_max}
        </div>
      )}
    </div>
  );
}
