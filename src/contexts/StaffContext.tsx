// src/contexts/StaffContext.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Evento {
  id: string;
  nombre: string;
  fecha_inicio: string;
  ubicacion: string;
  aforo_max: number;
}

interface StaffContextType {
  eventos: Evento[];
  eventoSeleccionado: string;
  setEventoSeleccionado: (id: string) => void;
  eventoActual: Evento | null;
  cargarEventos: () => Promise<void>;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<string>('');

  const cargarEventos = async () => {
    try {
      const response = await fetch('/api/eventos?estado=programado');
      const data = await response.json();
      
      if (data.success && data.eventos.length > 0) {
        setEventos(data.eventos);
        
        // Seleccionar primer evento si no hay uno seleccionado
        if (!eventoSeleccionado && data.eventos.length > 0) {
          const saved = localStorage.getItem('staff_evento_seleccionado');
          setEventoSeleccionado(saved || data.eventos[0].id);
        }
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  useEffect(() => {
    if (eventoSeleccionado) {
      localStorage.setItem('staff_evento_seleccionado', eventoSeleccionado);
    }
  }, [eventoSeleccionado]);

  const eventoActual = eventos.find(e => e.id === eventoSeleccionado) || null;

  return (
    <StaffContext.Provider value={{
      eventos,
      eventoSeleccionado,
      setEventoSeleccionado,
      eventoActual,
      cargarEventos,
    }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff debe usarse dentro de StaffProvider');
  }
  return context;
}
