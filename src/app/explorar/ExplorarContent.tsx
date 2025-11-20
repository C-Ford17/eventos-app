// src/app/explorar/ExplorarContent.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Calendar, MapPin, Ticket, X, ChevronDown } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';

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
  precio_base: number;
}

export default function ExplorarContent() {
  const searchParams = useSearchParams();
  const queryBusqueda = searchParams.get('q') || '';

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState(queryBusqueda);
  const [categoriaFiltroId, setCategoriaFiltroId] = useState('todas');
  const [categoriaFiltroNombre, setCategoriaFiltroNombre] = useState('Todas las categorías');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    if (categoriaFiltroId !== 'todas') {
      params.append('categoria', categoriaFiltroId);
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
  }, [categoriaFiltroId]);

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

  const formatearPrecio = (precio: number) => {
    if (!precio || precio === 0) return 'Gratis';
    return `$${precio.toLocaleString('es-CO')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 animate-pulse">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Header */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-[#0a0a0a] z-0" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Explora Eventos
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Descubre las mejores experiencias, conciertos y actividades cerca de ti.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        {/* Filtros */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, lugar o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="md:col-span-4 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <CustomDropdown
                options={[
                  { value: 'todas', label: 'Todas las categorías' },
                  ...categorias.map(c => ({ value: c.id, label: c.nombre }))
                ]}
                value={categoriaFiltroId}
                onChange={(value) => {
                  const selected = value === 'todas'
                    ? { nombre: 'Todas las categorías' }
                    : categorias.find(c => c.id === value);
                  setCategoriaFiltroId(value);
                  setCategoriaFiltroNombre(selected?.nombre || 'Todas las categorías');
                }}
                buttonClassName="pl-12"
              />
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Resultados <span className="text-gray-500 text-sm font-normal ml-2">({eventosFiltrados.length})</span>
          </h2>
        </div>

        {/* Grid de eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventosFiltrados.map((evento) => {
            const porcentajeOcupacion = evento.aforo_max > 0
              ? ((evento.boletos_vendidos / evento.aforo_max) * 100)
              : 0;

            return (
              <Link
                key={evento.id}
                href={`/eventos/${evento.id}`}
                className="group bg-[#121212] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Imagen del evento */}
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-60 z-10" />
                  {evento.imagen_url ? (
                    <img
                      src={evento.imagen_url}
                      alt={evento.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                      <Ticket className="w-12 h-12 text-neutral-600" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-medium rounded-full">
                      {evento.categoria.nombre}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 z-20">
                    <div className="text-white font-bold text-lg bg-blue-600 px-3 py-1 rounded-lg shadow-lg">
                      {formatearPrecio(evento.precio_base)}
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {evento.nombre}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <Calendar size={16} className="text-blue-500" />
                      {new Date(evento.fecha_inicio).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <MapPin size={16} className="text-blue-500" />
                      <span className="truncate">{evento.ubicacion}</span>
                    </div>
                  </div>

                  {/* Disponibilidad */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-500">Disponibilidad</span>
                      <span className={evento.boletos_disponibles > 10 ? 'text-green-400' : 'text-yellow-400'}>
                        {evento.boletos_disponibles} lugares
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${porcentajeOcupacion > 80 ? 'bg-red-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${Math.min(porcentajeOcupacion, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {eventosFiltrados.length === 0 && (
          <div className="text-center py-24 bg-[#121212] border border-white/5 rounded-3xl">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No encontramos eventos</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.
            </p>
            <button
              onClick={() => {
                setBusqueda('');
                setCategoriaFiltroId('todas');
                setCategoriaFiltroNombre('Todas las categorías');
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full transition-all"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
