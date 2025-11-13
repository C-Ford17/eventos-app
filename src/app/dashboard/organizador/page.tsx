'use client'; // obliga el renderizado client-side para manejar hooks
import { useState, useEffect } from 'react';
import EventoForm from '@/components/EventoForm';
import DataTable from '@/components/DataTable';

export default function OrganizadorPanel() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Refresca la lista tras crear un evento nuevo
  const handleNuevoEvento = async () => {
    const res = await fetch('/api/eventos');
    const data = await res.json();
    setEventos(data);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Panel de Organizador</h1>
      {/* Formulario para crear eventos */}
      <EventoForm onSubmitted={handleNuevoEvento} />
      {/* Tabla para listar eventos */}
      {loading ? (
        <div className="text-gray-400">Cargando eventos...</div>
      ) : (
        <DataTable
          title="Listado de eventos"
          columns={["nombre", "estado", "fecha"]}
          data={eventos}
        />
      )}
    </div>
  );
}
