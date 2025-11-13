// src/components/EventoCard.tsx
interface Evento {
  id: string;
  nombre: string;
  fecha: string;
  lugar: string;
  estado?: string;
  imagen?: string; // Puedes agregar url de imagen si tu evento lo tiene
}

export default function EventoCard({ evento }: { evento: Evento }) {
  return (
    <div className="bg-neutral-900 rounded-lg overflow-hidden shadow p-4 flex flex-col">
      <img
        src={evento.imagen || "/evento-default.jpg"}
        alt={evento.nombre}
        className="h-36 w-full object-cover mb-2 rounded"
      />
      <div className="font-bold text-xl mb-2">{evento.nombre}</div>
      <div className="text-neutral-400 mb-1">{evento.fecha} — {evento.lugar}</div>
      {evento.estado && (
        <div className="text-xs text-green-400 mb-2">Estado: {evento.estado}</div>
      )}
      <a
        href={`/evento/${evento.id}`}
        className="text-blue-400 font-semibold text-sm hover:underline mt-auto self-end"
      >Ver detalles</a>
    </div>
  );
}
