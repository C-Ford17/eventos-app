// src/app/explorar/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Evento {
  id: string;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  ubicacion: string;
  aforo_max: number;
  imagen_url: string | null;
  categoria: {
    id: string;
    nombre: string;
  };
  boletos_vendidos: number;
  boletos_disponibles: number;
}

export default function ExplorarEventosPage() {
  const searchParams = useSearchParams();
  const queryBusqueda = searchParams.get('q') || '';
  
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState(queryBusqueda);
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [categorias, setCategorias] = useState<any[]>([]);

  // Cargar categorías
  useEffect(() => {
    fetch('/api/categorias')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategorias(data.categorias);
        }
      })
      .catch(err => console.error('Error cargando categorías:', err));
  }, []);

  // Cargar eventos
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    
    if (categoriaFiltro !== 'todas') {
      params.append('categoria', categoriaFiltro);
    }

    fetch(`/api/eventos?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEventos(data.eventos);
        }
      })
      .catch(err => console.error('Error cargando eventos:', err))
      .finally(() => setLoading(false));
  }, [categoriaFiltro]);

  // Actualizar búsqueda cuando viene del query param
  useEffect(() => {
    if (queryBusqueda) {
      setBusqueda(queryBusqueda);
    }
  }, [queryBusqueda]);

  // Filtrado local por búsqueda
const eventosFiltrados = eventos.filter(evento => {
  const searchTerm = busqueda.toLowerCase();
  
  const matchBusqueda = 
    (evento.nombre?.toLowerCase() || '').includes(searchTerm) ||
    (evento.descripcion?.toLowerCase() || '').includes(searchTerm) ||
    (evento.ubicacion?.toLowerCase() || '').includes(searchTerm) ||
    (evento.categoria?.nombre?.toLowerCase() || '').includes(searchTerm);

  return matchBusqueda;
});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Descubre Eventos Increíbles
          </h1>
          <p className="text-xl text-gray-200">
            Encuentra y reserva tu próxima experiencia
          </p>
          {queryBusqueda && (
            <p className="text-gray-300 mt-2">
              Resultados para: <span className="font-semibold">"{queryBusqueda}"</span>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="bg-neutral-800 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="px-4 py-3 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="px-4 py-3 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <p className="text-gray-400">
            {eventosFiltrados.length} evento{eventosFiltrados.length !== 1 ? 's' : ''} encontrado{eventosFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Grid de eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventosFiltrados.map((evento) => {
            const porcentajeOcupacion = evento.aforo_max > 0 
              ? ((evento.boletos_vendidos / evento.aforo_max) * 100) 
              : 0;

            return (
              <Link
                key={evento.id}
                href={`/eventos/${evento.id}`}
                className="bg-neutral-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-200"
              >
                {/* Imagen del evento */}
                <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600">
                  {evento.imagen_url ? (
                    <img 
                      src={evento.imagen_url} 
                      alt={evento.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      {evento.categoria.nombre}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {evento.nombre}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {evento.descripcion}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-300 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(evento.fecha_inicio).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {evento.ubicacion}
                    </div>
                  </div>

                  {/* Disponibilidad */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Disponibilidad</span>
                      <span className={evento.boletos_disponibles > 10 ? 'text-green-400' : 'text-yellow-400'}>
                        {evento.boletos_disponibles} lugares
                      </span>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          porcentajeOcupacion > 80 ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(porcentajeOcupacion, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Botón */}
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition">
                    Ver Detalles
                  </button>
                </div>
              </Link>
            );
          })}
        </div>

        {eventosFiltrados.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400 text-lg mb-2">No se encontraron eventos</p>
            {busqueda && (
              <p className="text-gray-500 mb-4">
                No hay resultados para "{busqueda}"
              </p>
            )}
            <button
              onClick={() => {
                setBusqueda('');
                setCategoriaFiltro('todas');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
