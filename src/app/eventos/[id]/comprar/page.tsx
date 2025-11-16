// src/app/eventos/[id]/comprar/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface TipoEntrada {
  id: string;
  nombre: string;
  precio: number;
  disponible: boolean;
  cantidad?: number; // añadido para control local
}

export default function SeleccionEntradasPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id as string;

  const [evento, setEvento] = useState<any>(null);
  const [entradas, setEntradas] = useState<TipoEntrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Verificar usuario
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      router.push('/login');
    }
  }, [router]);

  // Cargar evento y entradas
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
          // Agregar campo 'cantidad' para control local
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-20 h-20 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Banner con imagen del evento */}
        <div className="h-64 relative rounded mb-8 overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600">
          {evento?.imagen_url ? (
            <img
              src={evento.imagen_url}
              alt={evento.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              <svg
                className="w-20 h-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
              {evento?.categoria?.nombre || 'Evento'}
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">
            Selecciona tus Entradas
          </h1>
          <p className="text-gray-400">
            {evento.nombre} |{' '}
            {new Date(evento.fecha_inicio).toLocaleDateString('es-ES')} -{' '}
            {new Date(evento.fecha_inicio).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            | {evento.ubicacion}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de entradas */}
          <div className="lg:col-span-2 space-y-4">
            {entradas.length > 0 ? (
              entradas.map((entrada) => (
                <div key={entrada.id} className="bg-neutral-800 p-6 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="w-12 h-12 bg-blue-900 rounded flex items-center justify-center mr-4">
                          <svg
                            className="w-6 h-6 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {entrada.nombre}
                          </h3>
                          <p className="text-2xl font-bold text-white">
                            ${Number(entrada.precio).toLocaleString('es-CO')}{' '}
                            <span className="text-sm text-gray-400">COP</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Selector de cantidad */}
                    <div className="flex items-center space-x-3 ml-4">
                      <button
                        onClick={() => handleDecrement(entrada.id)}
                        disabled={(entrada.cantidad || 0) === 0}
                        className="w-10 h-10 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-white w-12 text-center">
                        {entrada.cantidad || 0}
                      </span>
                      <button
                        onClick={() => handleIncrement(entrada.id)}
                        disabled={!entrada.disponible}
                        className="w-10 h-10 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  No hay tipos de entrada disponibles para este evento
                </p>
              </div>
            )}
          </div>

          {/* Resumen de compra */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800 p-6 rounded-lg sticky top-4">
              <h2 className="text-xl font-semibold text-white mb-4">
                Resumen de tu compra
              </h2>

              {totalEntradas > 0 ? (
                <>
                  {entradas
                    .filter((e) => (e.cantidad || 0) > 0)
                    .map((entrada) => (
                      <div
                        key={entrada.id}
                        className="flex justify-between text-gray-300 mb-2"
                      >
                        <span>
                          {entrada.cantidad}x {entrada.nombre}
                        </span>
                        <span>
                          $
                          {(
                            Number(entrada.precio) * (entrada.cantidad || 0)
                          ).toLocaleString('es-CO')}
                        </span>
                      </div>
                    ))}

                  <div className="border-t border-neutral-700 my-4"></div>

                  <div className="flex justify-between text-gray-300 mb-2">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString('es-CO')}</span>
                  </div>

                  <div className="flex justify-between text-gray-300 mb-2">
                    <span>Cargos por servicio</span>
                    <span>${cargoServicio.toLocaleString('es-CO')}</span>
                  </div>

                  <div className="border-t border-neutral-700 my-4"></div>

                  <div className="flex justify-between text-white text-xl font-bold mb-6">
                    <span>Total (COP)</span>
                    <span>${total.toLocaleString('es-CO')}</span>
                  </div>

                  <button
                    onClick={handleContinuar}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    Continuar con la Reserva
                  </button>
                </>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  Selecciona al menos una entrada para continuar
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
