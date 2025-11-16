// src/app/dashboard/asistente/page.tsx
'use client';

export default function AsistentePanel() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Panel de Asistente</h1>
      <section className="bg-neutral-800 p-4 rounded">
        <h2 className="text-lg font-medium mb-2">Mis reservas</h2>
        <p className="text-gray-400">Aquí verás tus reservas...</p>
      </section>
      <section className="bg-neutral-800 p-4 rounded">
        <h2 className="text-lg font-medium mb-2">Boletos/Entradas</h2>
        <p className="text-gray-400">Aquí verás tus boletos...</p>
      </section>
      <section className="bg-neutral-800 p-4 rounded">
        <h2 className="text-lg font-medium mb-2">Notificaciones</h2>
        <p className="text-gray-400">No tienes notificaciones nuevas</p>
      </section>
    </div>
  );
}
