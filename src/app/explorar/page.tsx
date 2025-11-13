// src/app/explorar/page.tsx
'use client';
import EventoCard from '@/components/EventoCard';
import FiltroEventos from '@/components/FiltroEventos';
import { Suspense } from 'react';

async function getEventos() {
  const res = await fetch('http://localhost:3000/api/eventos', { cache: "no-store" }); // Edita la URL si tu API está en producción
  return res.json();
}

export default async function ExplorarEventos() {
  const eventos = await getEventos();
  return (
    <div className="min-h-screen px-8 py-10 bg-neutral-950 text-white">
      <h1 className="text-3xl font-bold mb-8">Explorar eventos</h1>
      <FiltroEventos />
      <Suspense fallback={<div>Cargando eventos...</div>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {eventos.map((evento: any) => <EventoCard key={evento.id} evento={evento} />)}
        </div>
      </Suspense>
    </div>
  );
}


