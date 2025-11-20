// src/components/EventoSelector.tsx
'use client';
import { useStaff } from '@/contexts/StaffContext';
import { Calendar, MapPin, Users } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';

export default function EventoSelector() {
  const { eventos, eventoSeleccionado, setEventoSeleccionado, eventoActual } = useStaff();

  return (
    <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl mb-8 transition-all hover:border-blue-500/30">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="w-full md:w-1/3">
          <label className="block text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            Seleccionar Evento
          </label>
          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
            <CustomDropdown
              options={[
                { value: '', label: 'Selecciona un evento' },
                ...eventos.map(evento => ({
                  value: evento.id,
                  label: evento.nombre
                }))
              ]}
              value={eventoSeleccionado}
              onChange={(value) => setEventoSeleccionado(value)}
              placeholder="Selecciona un evento"
              buttonClassName="pl-12"
              className="w-full"
            />
          </div>
        </div>

        {eventoActual && (
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Ubicación</p>
                <p className="text-white text-sm font-medium truncate">{eventoActual.ubicacion}</p>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                <Users size={20} />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Aforo Máximo</p>
                <p className="text-white text-sm font-medium">{eventoActual.aforo_max} personas</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
