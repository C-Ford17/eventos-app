// src/app/eventos/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, Ticket, Clock, ArrowLeft, Share2, Heart, TrendingUp, Check } from 'lucide-react';

export default function DetalleEventoPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id;
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Check if event is favorited
  useEffect(() => {
    if (user && eventoId && user.tipo_usuario === 'asistente') {
      fetch(`/api/favoritos?usuario_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const isFav = data.favoritos.some((fav: any) => fav.evento_id === eventoId);
            setIsFavorite(isFav);
          }
        })
        .catch(err => console.error('Error checking favorite:', err));
    }
  }, [user, eventoId]);

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

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      if (isFavorite) {
        await fetch(`/api/favoritos?usuario_id=${user.id}&evento_id=${eventoId}`, {
          method: 'DELETE',
        });
        setIsFavorite(false);
      } else {
        await fetch('/api/favoritos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario_id: user.id, evento_id: eventoId }),
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    });
  };

  const shareToWhatsApp = () => {
    const url = window.location.href;
    const text = `¡Mira este evento! ${evento?.nombre}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToTwitter = () => {
    const url = window.location.href;
    const text = `¡Mira este evento! ${evento?.nombre}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
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
                  </div>
                </div>
              </div>
            </div>

            {/* Share Menu - Fixed positioning to avoid z-index issues */}
            {showShareMenu && (
              <>
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setShowShareMenu(false)}
                />
                <div className="fixed top-20 right-4 md:right-8 z-[9999] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-3 min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={copyToClipboard}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
                    {copied ? 'Copiado!' : 'Copiar enlace'}
                  </button>
                  <button
                    onClick={shareToWhatsApp}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={shareToFacebook}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                  <button
                    onClick={shareToTwitter}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    Twitter
                  </button>
                </div>
              </>
            )}

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
