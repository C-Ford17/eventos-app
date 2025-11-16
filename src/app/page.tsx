// src/app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Evento {
  id: string;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  ubicacion: string;
  imagen_url: string | null;
  precio_base: number;
  categoria: {
    nombre: string;
  };
}

export default function Home() {
  const router = useRouter();
  const [eventosDestacados, setEventosDestacados] = useState<Evento[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEventosDestacados();
  }, []);

  const cargarEventosDestacados = async () => {
    try {
      // Cargar eventos programados, ordenados por fecha
      const response = await fetch('/api/eventos?estado=programado&limit=4');
      const data = await response.json();
      
      if (data.success) {
        setEventosDestacados(data.eventos);
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (busqueda.trim()) {
      // Redirigir a explorar con el término de búsqueda
      router.push(`/explorar?q=${encodeURIComponent(busqueda.trim())}`);
    } else {
      router.push('/explorar');
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatearPrecio = (precio: number | null | undefined) => {
  if (precio === null || precio === undefined || precio === 0) {
    return 'Gratis';
  }
  return `$${precio.toLocaleString('es-CO')}`;
};

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Hero principal */}
      <section 
        className="flex flex-col items-center justify-center py-20 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/fondo-hero.jpg')" }}
      >
        {/* Overlay oscuro para mejor legibilidad */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-4 leading-tight">
            Descubre y Vive Experiencias<br />Inolvidables
          </h1>
          <p className="text-center text-lg text-neutral-300 mb-8 max-w-xl mx-auto">
            La plataforma definitiva para encontrar, gestionar y disfrutar de los mejores eventos a tu alrededor.
          </p>
          
          {/* Buscador funcional */}
          <form 
            onSubmit={handleBuscar}
            className="w-full max-w-lg mx-auto flex items-center gap-2"
          >
            <input 
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 px-5 py-3 rounded bg-neutral-900/90 backdrop-blur text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Buscar por evento, lugar o categoría..." 
            />
            <button 
              type="submit"
              className="px-5 py-3 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700 transition"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      {/* Sección destacada de eventos */}
      <section className="px-6 md:px-20 py-10">
        <div className="flex justify-between items-center mb-7">
          <h2 className="text-2xl font-bold">No te pierdas esto</h2>
          <Link 
            href="/explorar"
            className="text-blue-400 hover:text-blue-300 text-sm transition"
          >
            Ver todos los eventos →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-neutral-900 rounded-lg p-3 animate-pulse">
                <div className="w-full h-48 bg-neutral-800 rounded mb-2"></div>
                <div className="h-4 bg-neutral-800 rounded mb-2"></div>
                <div className="h-3 bg-neutral-800 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : eventosDestacados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {eventosDestacados.map((evento) => (
              <Link
                key={evento.id}
                href={`/eventos/${evento.id}`}
                className="bg-neutral-900 rounded-lg p-3 hover:bg-neutral-800 transition group"
              >
                {/* Imagen del evento */}
                <div className="relative w-full h-48 mb-2 overflow-hidden rounded bg-neutral-800">
                  {evento.imagen_url ? (
                    <img 
                      src={evento.imagen_url} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      alt={evento.nombre}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Badge de categoría */}
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {evento.categoria.nombre}
                  </div>
                </div>

                {/* Info del evento */}
                <div className="font-semibold line-clamp-1 group-hover:text-blue-400 transition">
                  {evento.nombre}
                </div>
                <div className="text-neutral-400 text-sm mt-1">
                  📅 {formatearFecha(evento.fecha_inicio)}
                </div>
                <div className="text-neutral-400 text-sm">
                  📍 {evento.ubicacion}
                </div>
                <div className="text-blue-400 text-sm font-semibold mt-2">
                  {formatearPrecio(evento.precio_base)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-400 mb-4">No hay eventos disponibles en este momento</p>
            <Link 
              href="/explorar"
              className="text-blue-400 hover:text-blue-300"
            >
              Explorar todos los eventos
            </Link>
          </div>
        )}
      </section>

      {/* Beneficios / Por qué elegirnos */}
      <section className="py-12 px-6 md:px-20 bg-neutral-950 border-t border-neutral-800">
        <h2 className="text-2xl font-bold mb-4">¿Por qué elegirnos?</h2>
        <p className="max-w-xl mb-8 text-neutral-400">
          Te ofrecemos la mejor experiencia para descubrir y organizar eventos, todo en un solo lugar.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 rounded p-6 flex flex-col items-center">
            <span className="text-blue-400 text-3xl mb-2">🎫</span>
            <p className="font-semibold mb-1">Descubre eventos únicos</p>
            <p className="text-neutral-400 text-sm text-center">
              Explora un catálogo curado de eventos y encuentra tu próxima gran experiencia.
            </p>
          </div>
          <div className="bg-neutral-900 rounded p-6 flex flex-col items-center">
            <span className="text-blue-400 text-3xl mb-2">📱</span>
            <p className="font-semibold mb-1">Gestiona tus entradas</p>
            <p className="text-neutral-400 text-sm text-center">
              Compra, almacena y accede a tus entradas de forma segura desde cualquier dispositivo.
            </p>
          </div>
          <div className="bg-neutral-900 rounded p-6 flex flex-col items-center">
            <span className="text-blue-400 text-3xl mb-2">🗓️</span>
            <p className="font-semibold mb-1">Organiza con facilidad</p>
            <p className="text-neutral-400 text-sm text-center">
              Nuestras herramientas intuitivas hacen que la creación y gestión de tu evento sea un proceso simple.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 md:px-20 mt-auto border-t border-neutral-800 text-neutral-400 text-xs flex flex-col md:flex-row justify-between gap-4">
        <div>© 2025 EventPlatform. Todos los derechos reservados.</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition">Términos de Servicio</a>
          <a href="#" className="hover:text-white transition">Política de Privacidad</a>
        </div>
      </footer>
    </div>
  );
}
