'use client';
import { useState, useEffect } from 'react';
import EventoCard from '@/components/EventoCard';
import { Evento } from '@/types/Evento'

export default function FiltroEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch(`/api/eventos?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then((data: Evento[]) => setEventos(data))
      .catch(() => setEventos([]));
  }, [query]);

  return (
    <div>
      <input
        className="bg-neutral-900 px-4 py-2 rounded mb-4"
        placeholder="Buscar evento o lugar..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {eventos.map(e => <EventoCard key={e.id} evento={e} />)}
      </div>
    </div>
  );
}
