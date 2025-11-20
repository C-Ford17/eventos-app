// src/app/eventos/[id]/comprar/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Ticket, Plus, Minus, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';

interface TipoEntrada {
  id: string;
  nombre: string;
  precio: number;
  disponible: boolean;
  cantidad?: number;
  descripcion?: string;
}

export default function SeleccionEntradasPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id as string;

  const [evento, setEvento] = useState<any>(null);
  const [entradas, setEntradas] = useState<TipoEntrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!eventoId) return;

    Promise.all([
      fetch(`/api/eventos/${eventoId}`).then(res => res.json()),
      fetch(`/api/eventos/${eventoId}/entradas`).then(res => res.json()),
    ])
      .then(([eventoData, entradasData]) => {
        if (eventoData.success) {
          setEvento(eventoData.evento);
        } else {
          router.push('/explorar');
        }

        if (entradasData.success) {
          setEntradas(
            entradasData.entradas.map((e: TipoEntrada) => ({ ...e, cantidad: 0 }))
          );
        }
      })
      .catch(() => router.push('/explorar'))
      .finally(() => setLoading(false));
  }, [eventoId, router]);

  const handleIncrement = (id: string) => {
    setEntradas(
      entradas.map((e) =>
        e.id === id && e.disponible ? { ...e, cantidad: (e.cantidad || 0) + 1 } : e
      )
    );
  };

  const handleDecrement = (id: string) => {
    setEntradas(
      entradas.map((e) =>
        e.id === id && (e.cantidad || 0) > 0
          ? { ...e, cantidad: (e.cantidad || 0) - 1 }
          : e
      )
    );
  };

  const subtotal = entradas.reduce(
    (sum, e) => sum + Number(e.precio) * (e.cantidad || 0),
    0
  );
  const cargoServicio = subtotal * 0.1;
  const total = subtotal + cargoServicio;
  const totalEntradas = entradas.reduce((sum, e) => sum + (e.cantidad || 0), 0);

  const handleContinuar = () => {
    if (totalEntradas === 0) {
      alert('Selecciona al menos una entrada');
      return;
    }

    const seleccion = {
      evento,
      entradas: entradas.filter((e) => (e.cantidad || 0) > 0),
      subtotal,
      cargoServicio,
      total,
    };
    localStorage.setItem('compraActual', JSON.stringify(seleccion));
    router.push(`/eventos/${eventoId}/comprar/confirmacion`);
  };

  if (loading || !evento) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-400 animate-pulse">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section with Gradient */}
      <div className="relative h-80 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0a0a0a]/40" />

        {/* Content */}
        <div className="relative h-full flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-8 pt-20 w-full">
            <button
              onClick={() => router.back()}
              className="text-gray-200 hover:text-white mb-4 flex items-center gap-2 transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Volver al evento
            </button>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white text-sm font-semibold rounded-full mb-3">
              <Ticket size={16} />
              <span>{evento?.categoria?.nombre || 'Evento'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Selecciona tus Entradas
            </h1>
            <p className="text-gray-200 text-sm">
              {evento.nombre} • {new Date(evento.fecha_inicio).toLocaleDateString('es-ES')} • {evento.ubicacion}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Selection */}
          <div className="lg:col-span-2 space-y-4">
            {entradas.length > 0 ? (
              entradas.map((entrada) => (
                <div
                  key={entrada.id}
                  className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl hover:border-blue-500/30 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                        <Ticket className="text-blue-400" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {entrada.nombre}
                        </h3>
                        {entrada.descripcion && (
                          <p className="text-gray-400 text-sm mb-2">{entrada.descripcion}</p>
                        )}
                        <p className="text-2xl font-bold text-green-400">
                          ${Number(entrada.precio).toLocaleString('es-CO')}
                          <span className="text-sm text-gray-500 ml-2">COP</span>
                        </p>
                        {!entrada.disponible && (
                          <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                            <AlertCircle size={16} />
                            <span>Agotado</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDecrement(entrada.id)}
                        disabled={(entrada.cantidad || 0) === 0}
                        className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="text-2xl font-bold text-white w-12 text-center">
                        {entrada.cantidad || 0}
                      </span>
                      <button
                        onClick={() => handleIncrement(entrada.id)}
                        disabled={!entrada.disponible}
                        className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  {(entrada.cantidad || 0) > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Subtotal ({entrada.cantidad}x)</span>
                        <span className="text-white font-semibold">
                          ${(Number(entrada.precio) * (entrada.cantidad || 0)).toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-[#1a1a1a]/40 border border-white/5 rounded-2xl">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Ticket className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No hay entradas disponibles</h3>
                <p className="text-gray-400">
                  Este evento no tiene tipos de entrada configurados
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingCart className="text-blue-400" size={20} />
                <h2 className="text-xl font-bold text-white">
                  Resumen de tu compra
                </h2>
              </div>

              {totalEntradas > 0 ? (
                <>
                  {entradas
                    .filter((e) => (e.cantidad || 0) > 0)
                    .map((entrada) => (
                      <div
                        key={entrada.id}
                        className="flex justify-between text-gray-300 mb-3 pb-3 border-b border-white/5"
                      >
                        <span className="text-sm">
                          {entrada.cantidad}x {entrada.nombre}
                        </span>
                        <span className="font-semibold">
                          ${(Number(entrada.precio) * (entrada.cantidad || 0)).toLocaleString('es-CO')}
                        </span>
                      </div>
                    ))}

                  <div className="border-t border-white/10 my-4 pt-4 space-y-3">
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>Cargos por servicio (10%)</span>
                      <span>${cargoServicio.toLocaleString('es-CO')}</span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 my-4 pt-4">
                    <div className="flex justify-between text-white text-xl font-bold mb-6">
                      <span>Total</span>
                      <span>${total.toLocaleString('es-CO')}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleContinuar}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Continuar con la Reserva
                  </button>

                  <p className="text-gray-500 text-xs text-center mt-4">
                    Al continuar, aceptas nuestros términos y condiciones
                  </p>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="text-gray-600" size={24} />
                  </div>
                  <p className="text-gray-400 text-sm">
                    Selecciona al menos una entrada para continuar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
