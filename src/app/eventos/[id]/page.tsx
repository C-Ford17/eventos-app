// src/app/eventos/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, Ticket, Clock, ArrowLeft, Share2, Heart, TrendingUp } from 'lucide-react';

export default function DetalleEventoPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id;
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    fetch(`/api/eventos/${eventoId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEvento(data.evento);
        }
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, [eventoId]);

  const handleComprar = () => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', `/eventos/${eventoId}`);
      router.push('/login');
      return;
    }

    if (user.tipo_usuario === 'organizador' || user.tipo_usuario === 'proveedor') {
      alert('Solo los asistentes pueden comprar boletos. Tu cuenta es de tipo: ' + user.tipo_usuario);
      return;
    }

    router.push(`/eventos/${eventoId}/comprar`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 animate-pulse">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket className="text-gray-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Evento no encontrado</h2>
          <p className="text-gray-400 mb-8">El evento que buscas no existe o fue eliminado.</p>
          <Link
            href="/explorar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all"
          >
            <ArrowLeft size={18} />
            Volver a explorar
          </Link>
        </div>
      </div>
    );
  }

  const disponibilidad = evento.disponibilidad;
  const porcentajeOcupacion = parseFloat(evento.porcentajeOcupacion);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section with Gradient */}
      <div className="relative h-[500px] bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0a0a0a]/40" />

        {/* Content */}
        <div className="relative h-full flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-12 pt-20 w-full">
            <button
              onClick={() => router.push('/explorar')}
              className="text-gray-300 hover:text-white mb-6 flex items-center gap-2 transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Volver a explorar
            </button>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white text-sm font-semibold rounded-full mb-4">
                  <span>{evento.categoria.nombre}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {evento.nombre}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-200">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-blue-300" />
                    <span className="text-sm">{evento.organizador.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-green-300" />
                    <span className="text-sm font-medium">{evento.totalReservas} asistentes confirmados</span>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="p-3 bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 rounded-xl transition-all">
                  <Share2 size={20} className="text-white" />
                </button>
                <button className="p-3 bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 rounded-xl transition-all">
                  <Heart size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl hover:border-blue-500/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Calendar className="text-blue-400" size={20} />
                  </div>
                  <span className="text-gray-400 text-sm font-medium">Fecha</span>
                </div>
                <p className="text-white font-semibold">
                  {new Date(evento.fecha_inicio).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(evento.fecha_inicio).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl hover:border-purple-500/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                    <MapPin className="text-purple-400" size={20} />
                  </div>
                  <span className="text-gray-400 text-sm font-medium">Ubicación</span>
                </div>
                <p className="text-white font-semibold">{evento.ubicacion}</p>
              </div>

              <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl hover:border-green-500/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                    <Ticket className="text-green-400" size={20} />
                  </div>
                  <span className="text-gray-400 text-sm font-medium">Desde</span>
                </div>
                <p className="text-white font-bold text-xl">
                  {evento.precio_base && evento.precio_base > 0
                    ? `$${evento.precio_base.toLocaleString('es-CO')}`
                    : 'Gratis'
                  }
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#1a1a1a]/60 border border-white/10 p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">Acerca del evento</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {evento.descripcion}
              </p>
            </div>

            {/* Ticket Types */}
            {evento.tiposEntrada && evento.tiposEntrada.length > 0 && (
              <div className="bg-[#1a1a1a]/60 border border-white/10 p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Tipos de entrada</h2>
                <div className="space-y-4">
                  {evento.tiposEntrada.map((tipo: any) => (
                    <div
                      key={tipo.id}
                      className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl hover:border-blue-500/30 transition-all"
                    >
                      <div>
                        <h3 className="text-white font-semibold mb-1">{tipo.nombre}</h3>
                        <p className="text-gray-400 text-sm">Entrada estándar</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">
                          ${parseFloat(tipo.precio).toLocaleString('es-CO')}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {tipo.cantidad_disponible} disponibles
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl sticky top-4">
              <h3 className="text-xl font-bold text-white mb-6">Reserva tu entrada</h3>

              {/* Availability */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Disponibilidad</span>
                  <span className={disponibilidad > 20 ? 'text-green-400' : disponibilidad > 0 ? 'text-yellow-400' : 'text-red-400'}>
                    {disponibilidad > 0 ? `${disponibilidad} lugares` : 'Agotado'}
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${porcentajeOcupacion > 80 ? 'bg-red-500' :
                      porcentajeOcupacion > 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${porcentajeOcupacion}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-2">{porcentajeOcupacion.toFixed(0)}% ocupado</p>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleComprar}
                disabled={disponibilidad === 0}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mb-4"
              >
                <Ticket size={20} />
                {disponibilidad === 0 ? 'Agotado' : 'Comprar Boletos'}
              </button>

              {!user && (
                <p className="text-center text-gray-400 text-sm">
                  <Link href="/login" className="text-blue-400 hover:text-blue-300">
                    Inicia sesión
                  </Link>
                  {' '}para comprar boletos
                </p>
              )}

              {/* Info Cards */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <Clock size={16} />
                  <span>Confirmación instantánea</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <Ticket size={16} />
                  <span>E-ticket móvil</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <Users size={16} />
                  <span>Política de cancelación flexible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
