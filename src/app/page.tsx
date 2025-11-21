// src/app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Calendar, MapPin, Ticket, Star, Shield, Zap } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/fondo-hero.jpg')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#0a0a0a]" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-blue-400 mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Star size={14} className="fill-blue-400" />
            <span>La plataforma #1 de eventos</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Descubre y Vive
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Experiencias Inolvidables
            </span>
          </h1>

          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Conecta con los mejores eventos, conciertos y conferencias.
            Gestiona tus entradas de forma segura y disfruta el momento.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleBuscar}
            className="w-full max-w-2xl mx-auto relative group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 px-4 sm:px-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity" />
            <div className="relative flex items-center bg-[#1a1a1a] border border-white/10 rounded-full p-1.5 sm:p-2 shadow-2xl">
              <Search className="ml-3 sm:ml-4 text-gray-400 shrink-0" size={20} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base sm:text-lg w-full min-w-0"
                placeholder="Busca eventos..."
              />

              {/* Desktop Button */}
              <button
                type="submit"
                className="hidden sm:block px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full transition-all hover:shadow-lg hover:shadow-blue-600/25 active:scale-95"
              >
                Buscar
              </button>

              {/* Mobile Button */}
              <button
                type="submit"
                className="sm:hidden p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all hover:shadow-lg hover:shadow-blue-600/25 active:scale-95 shrink-0"
                aria-label="Buscar"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Events */}
      <section className="px-6 md:px-20 py-20 relative z-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Eventos Destacados</h2>
            <p className="text-gray-400">No te pierdas las mejores experiencias de la temporada</p>
          </div>
          <Link
            href="/explorar"
            className="group flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            Ver todos
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/5 rounded-2xl p-4 animate-pulse h-[400px]" />
            ))}
          </div>
        ) : eventosDestacados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {eventosDestacados.map((evento) => (
              <Link
                key={evento.id}
                href={`/eventos/${evento.id}`}
                className="group relative bg-[#121212] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-60 z-10" />
                  {evento.imagen_url ? (
                    <img
                      src={evento.imagen_url}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={evento.nombre}
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                      <Ticket className="w-12 h-12 text-neutral-600" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    {evento.categoria.nombre}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                      {evento.nombre}
                    </h3>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar size={14} className="text-blue-500" />
                      {formatearFecha(evento.fecha_inicio)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin size={14} className="text-blue-500" />
                      <span className="truncate">{evento.ubicacion}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-sm text-gray-500">Desde</div>
                    <div className="text-lg font-bold text-white">
                      {formatearPrecio(evento.precio_base)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No hay eventos destacados</h3>
            <p className="text-gray-400 mb-6">Sé el primero en crear un evento increíble</p>
            <Link
              href="/explorar"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors"
            >
              Explorar Eventos
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-20 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Por qué elegirnos?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Creamos la mejor experiencia para que solo te preocupes por disfrutar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Star,
                title: "Eventos Exclusivos",
                desc: "Acceso a las mejores experiencias seleccionadas especialmente para ti.",
                color: "text-yellow-400"
              },
              {
                icon: Shield,
                title: "Compra Segura",
                desc: "Tecnología de punta para garantizar que tus entradas sean 100% válidas.",
                color: "text-green-400"
              },
              {
                icon: Zap,
                title: "Gestión Simple",
                desc: "Organiza, vende y gestiona tus propios eventos en cuestión de minutos.",
                color: "text-blue-400"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-[#121212] border border-white/5 p-8 rounded-2xl hover:bg-white/5 transition-colors group">
                <div className={`w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-20 border-t border-white/5 bg-[#050505] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="Logo"
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-xl font-bold text-white">EventPlatform</span>
          </div>

          <div className="flex gap-8 text-sm text-gray-400">
            <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/ayuda" className="hover:text-white transition-colors">Ayuda</Link>
          </div>

          <div className="text-sm text-gray-500">
            © 2025 EventPlatform. Hecho con 💙
          </div>
        </div>
      </footer>
    </div>
  );
}
