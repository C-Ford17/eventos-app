// src/app/explorar/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ExplorarEventosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [fechaFiltro, setFechaFiltro] = useState('todas');

  // Datos de ejemplo - luego vendrán de la API
  const eventos = [
    {
      id: 1,
      nombre: 'Tech Summit 2024',
      descripcion: 'Conferencia sobre las últimas tecnologías y tendencias en desarrollo',
      fecha: '2024-11-01',
      lugar: 'Centro de Convenciones',
      categoria: 'Tecnología',
      precio: 75000,
      aforo: 200,
      reservas: 150,
      imagen: 'https://via.placeholder.com/400x250?text=Tech+Summit',
    },
    {
      id: 2,
      nombre: 'Festival de Música Electrónica',
      descripcion: 'Los mejores DJs nacionales e internacionales',
      fecha: '2024-11-15',
      lugar: 'Gran Parque Urbano',
      categoria: 'Música',
      precio: 80000,
      aforo: 500,
      reservas: 84,
      imagen: 'https://via.placeholder.com/400x250?text=Music+Festival',
    },
    {
      id: 3,
      nombre: 'Taller de Acuarela Creativa',
      descripcion: 'Aprende técnicas avanzadas de acuarela',
      fecha: '2024-11-08',
      lugar: 'Estudio de Arte Local',
      categoria: 'Arte',
      precio: 30000,
      aforo: 15,
      reservas: 12,
      imagen: 'https://via.placeholder.com/400x250?text=Art+Workshop',
    },
    {
      id: 4,
      nombre: 'Maratón Ciudad 2024',
      descripcion: 'Carrera de 10K por las calles de la ciudad',
      fecha: '2024-11-20',
      lugar: 'Parque Principal',
      categoria: 'Deportes',
      precio: 40000,
      aforo: 300,
      reservas: 180,
      imagen: 'https://via.placeholder.com/400x250?text=Marathon',
    },
    {
      id: 5,
      nombre: 'Conferencia de Negocios',
      descripcion: 'Networking y charlas sobre emprendimiento',
      fecha: '2024-11-12',
      lugar: 'Hotel Empresarial',
      categoria: 'Negocios',
      precio: 120000,
      aforo: 100,
      reservas: 65,
      imagen: 'https://via.placeholder.com/400x250?text=Business+Conference',
    },
  ];

  // Filtrado de eventos
  const eventosFiltrados = eventos.filter(evento => {
    const matchBusqueda = evento.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          evento.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaFiltro === 'todas' || evento.categoria === categoriaFiltro;
    
    let matchFecha = true;
    if (fechaFiltro === 'hoy') {
      const hoy = new Date().toISOString().split('T')[0];
      matchFecha = evento.fecha === hoy;
    } else if (fechaFiltro === 'semana') {
      const hoy = new Date();
      const semana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
      const fechaEvento = new Date(evento.fecha);
      matchFecha = fechaEvento >= hoy && fechaEvento <= semana;
    }
    
    return matchBusqueda && matchCategoria && matchFecha;
  });

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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="bg-neutral-800 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="Tecnología">Tecnología</option>
              <option value="Música">Música</option>
              <option value="Arte">Arte</option>
              <option value="Deportes">Deportes</option>
              <option value="Negocios">Negocios</option>
            </select>
            <select
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="px-4 py-3 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas las fechas</option>
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
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
            const disponibilidad = evento.aforo - evento.reservas;
            const porcentajeOcupacion = (evento.reservas / evento.aforo) * 100;

            return (
              <Link
                key={evento.id}
                href={`/eventos/${evento.id}`}
                className="bg-neutral-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-200"
              >
                {/* Imagen del evento */}
                <div className="relative h-48 bg-neutral-700">
                  <img
                    src={evento.imagen}
                    alt={evento.nombre}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      {evento.categoria}
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
                      {new Date(evento.fecha).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
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
                      {evento.lugar}
                    </div>
                  </div>

                  {/* Disponibilidad */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Disponibilidad</span>
                      <span className={disponibilidad > 10 ? 'text-green-400' : 'text-yellow-400'}>
                        {disponibilidad} lugares
                      </span>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          porcentajeOcupacion > 80 ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${porcentajeOcupacion}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Precio y botón */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs">Desde</p>
                      <p className="text-2xl font-bold text-white">
                        ${evento.precio.toLocaleString('es-CO')}
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition">
                      Ver Detalles
                    </button>
                  </div>
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
            <p className="text-gray-400 text-lg">No se encontraron eventos con los filtros seleccionados</p>
            <button
              onClick={() => {
                setBusqueda('');
                setCategoriaFiltro('todas');
                setFechaFiltro('todas');
              }}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
