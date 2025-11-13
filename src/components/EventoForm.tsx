// src/components/EventoForm.tsx
'use client';
import React, { useState } from 'react';

export default function EventoForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('');
  const [aforo, setAforo] = useState(0);
  const [estado, setEstado] = useState('activo');
  //...otros campos

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, fecha, lugar, aforo, estado })
    });
    if (onSubmitted) onSubmitted();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full border px-2 py-1" />
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required className="w-full border px-2 py-1" />
      <input type="text" placeholder="Lugar" value={lugar} onChange={e => setLugar(e.target.value)} required className="w-full border px-2 py-1" />
      <input type="number" placeholder="Aforo" value={aforo} onChange={e => setAforo(Number(e.target.value))} required className="w-full border px-2 py-1" />
      {/* Agrega el resto de campos según tu modelo */}
      <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded">Guardar evento</button>
    </form>
  );
}
