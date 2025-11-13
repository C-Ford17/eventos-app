'use client'; // obliga el renderizado client-side para manejar hooks
import { useState, useEffect } from 'react';
import EventoForm from '@/components/EventoForm';
import DataTable from '@/components/DataTable';

export default function OrganizadorPanel() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  // Obtiene la lista de eventos al montar el componente
  useEffect(() => {
    async function fetchEventos() {
      setLoading(true);
      const res = await fetch('/api/eventos');
      const data = await res.json();
      setEventos(data);
      setLoading(false);
    }
    fetchEventos();
  }, []);

  interface Evento {
    id: string;
    nombre: string;
    estado: string;
    fecha: string;
    lugar: string;
    aforo: number;
  }

  // Refresca la lista tras crear un evento nuevo
  const handleNuevoEvento = async (): Promise<void> => {
    const res = await fetch('/api/eventos');
    const data: Evento[] = await res.json();
    setEventos(data);
  };

  const handleEditarEvento = (evento: Evento): void => {
    setEventoEditando(evento);
  };

  const handleFinEdicion = (): void => {
    setEventoEditando(null);
    handleNuevoEvento(); // refresca la lista
  };

  const handleEliminarEvento = async (id: string) => {
  if (confirm('¿Seguro que quieres eliminar este evento?')) {
    await fetch('/api/eventos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    // Refresca la lista
    handleNuevoEvento();
  }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Panel de Organizador</h1>
      {/* Formulario para crear eventos */}
      <EventoForm onSubmitted={handleNuevoEvento} />
      {/* Tabla para listar eventos */}
      {eventoEditando && (
        <EventoForm evento={eventoEditando} onSubmitted={handleFinEdicion} />
      )}

      {loading ? (
        <div className="text-gray-400">Cargando eventos...</div>
      ) : (
        // ...
        <DataTable
          title="Listado de eventos"
          columns={["nombre", "estado", "fecha", "acciones"]}
          data={eventos.map(e => ({ ...e, acciones: (
            <div className="flex gap-2">
              <button
                className="text-blue-600 underline text-sm"
                onClick={() => handleEditarEvento(e)}>
                Editar
              </button>
              <button
                className="text-red-600 underline text-sm"
                onClick={() => handleEliminarEvento(e.id)}>
                Eliminar
              </button>
            </div>
          )}))}
        />
      )}
    </div>
  );
}
