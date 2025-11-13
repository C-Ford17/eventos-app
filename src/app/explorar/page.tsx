// src/app/explorar/page.tsx
export default function ExplorarEventos() {
  // Esta sería la estructura inicial, luego la conectas con el backend
  return (
    <div className="min-h-screen px-8 py-10 bg-neutral-950 text-white">
      <h1 className="text-3xl font-bold mb-8">Explorar eventos</h1>
      {/* Barra de búsqueda y filtros */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <input className="bg-neutral-900 px-4 py-2 rounded" placeholder="Buscar evento, localidad..." />
        <select className="bg-neutral-900 px-2 py-2 rounded"><option>Categoría</option><option>Conciertos</option><option>Talleres</option><option>Ferias</option></select>
        <input className="bg-neutral-900 px-4 py-2 rounded" type="date" />
        <button className="bg-blue-600 text-white px-5 py-2 rounded">Filtrar</button>
      </div>
      {/* Grid de tarjetas de eventos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Muestra eventos mock; luego conecta con tu endpoint real */}
        <div className="bg-neutral-900 rounded p-4 flex flex-col gap-2">
          <img src="/rock.jpg" className="rounded mb-2 h-40 object-cover" alt="Evento Rock" />
          <div className="font-semibold text-lg">Concierto Rock Indie</div>
          <div className="text-neutral-400">Octubre 25, Arena Principal</div>
          <a href="#" className="text-blue-400 text-xs mt-1">Ver detalles</a>
        </div>
        <div className="bg-neutral-900 rounded p-4 flex flex-col gap-2">
          <img src="/tech.jpg" className="rounded mb-2 h-40 object-cover" alt="Tech Summit" />
          <div className="font-semibold text-lg">Tech Summit 2024</div>
          <div className="text-neutral-400">Nov 1, Convenciones</div>
          <a href="#" className="text-blue-400 text-xs mt-1">Ver detalles</a>
        </div>
        <div className="bg-neutral-900 rounded p-4 flex flex-col gap-2">
          <img src="/acuar.jpg" className="rounded mb-2 h-40 object-cover" alt="Acuarela" />
          <div className="font-semibold text-lg">Taller Acuarela Creativa</div>
          <div className="text-neutral-400">Sábados, Estudio de Arte</div>
          <a href="#" className="text-blue-400 text-xs mt-1">Ver detalles</a>
        </div>
      </div>
    </div>
  );
}
