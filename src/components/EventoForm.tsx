// src/components/EventoForm.tsx
'use client';
import React, { useState, useEffect } from 'react';

interface Evento {
  id?: string;
  nombre: string;
  fecha: string;
  lugar: string;
  aforo: number;
  estado: string;
}

type Props = {
  evento?: Evento;
  onSubmitted?: () => void;
};

export default function EventoForm({ evento, onSubmitted }: Props) {
  const [nombre, setNombre] = useState<string>(evento?.nombre || '');
  const [fecha, setFecha] = useState<string>(evento?.fecha || '');
  const [lugar, setLugar] = useState<string>(evento?.lugar || '');
  const [aforo, setAforo] = useState<number>(evento?.aforo ?? 0);
  const [estado, setEstado] = useState<string>(evento?.estado || 'activo');

  useEffect(() => {
    if (evento) {
      setNombre(evento.nombre);
      setFecha(evento.fecha);
      setLugar(evento.lugar);
      setAforo(evento.aforo);
      setEstado(evento.estado);
    }
  }, [evento]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const method = evento ? 'PUT' : 'POST';
    await fetch('/api/eventos', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: evento?.id,
        nombre, fecha, lugar, aforo, estado,
      }),
    });
    if (onSubmitted) onSubmitted();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full border px-2 py-1" />
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required className="w-full border px-2 py-1" />
      <input type="text" placeholder="Lugar" value={lugar} onChange={e => setLugar(e.target.value)} required className="w-full border px-2 py-1" />
      <input type="number" placeholder="Aforo" value={aforo} onChange={e => setAforo(Number(e.target.value))} required className="w-full border px-2 py-1" />
      <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded">
        {evento ? 'Actualizar evento' : 'Guardar evento'}
      </button>
    </form>
  );
}
