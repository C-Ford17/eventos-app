// src/app/eventos/[id]/comprar/confirmacion/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ConfirmacionReservaPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id as string;
  const [compra, setCompra] = useState<any>(null);
  const [evento, setEvento] = useState<any>(null);

  useEffect(() => {
    const compraStr = localStorage.getItem('compraActual');
    if (!compraStr) {
      router.push(`/eventos/${eventoId}`);
      return;
    }
    setCompra(JSON.parse(compraStr));
  }, [eventoId, router]);

  // Opcional: recarga el evento para obtener la imagen actual si compra.evento no la trae
  useEffect(() => {
    if (compra && (!compra.evento.imagen_url || !compra.evento.categoria)) {
      fetch(`/api/eventos/${eventoId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setEvento(data.evento);
        });
    }
  }, [compra, eventoId]);

  const handleEditarSeleccion = () => {
    router.back();
  };

  const handleCancelarReserva = () => {
    if (window.confirm('¿Estás seguro que deseas cancelar la reserva?')) {
      localStorage.removeItem('compraActual');
      router.push(`/eventos/${eventoId}`);
    }
  };

  const handleConfirmarYPagar = () => {
    router.push(`/eventos/${eventoId}/comprar/pago`);
  };

  if (!compra) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  // Preferir la info de evento que fue recargada si existe
  const eventoInfo = evento || compra.evento;

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Confirma tu reserva</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumen de la reserva */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del evento */}
            <div className="bg-neutral-800 p-6 rounded-lg">
              <div className="flex items-start space-x-4">
                {eventoInfo.imagen_url ? (
                  <img
                    src={eventoInfo.imagen_url}
                    alt={eventoInfo.nombre}
                    className="w-32 h-32 object-cover rounded"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 rounded text-white/50">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    {eventoInfo.nombre}
                  </h2>
                  <div className="space-y-1 text-gray-300">
                    <p>
                      {new Date(eventoInfo.fecha_inicio || eventoInfo.fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                      -{' '}
                      {new Date(eventoInfo.fecha_inicio || eventoInfo.fecha).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p>{eventoInfo.ubicacion || eventoInfo.lugar}</p>
                    {eventoInfo?.categoria?.nombre && (
                      <p className="text-blue-400 text-xs mt-1">
                        {eventoInfo.categoria.nombre}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Entradas seleccionadas */}
            <div className="bg-neutral-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Entradas Seleccionadas</h3>
              <div className="space-y-4">
                {compra.entradas.map((entrada: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-neutral-900 rounded">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-900 rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {entrada.cantidad}x {entrada.nombre}
                        </p>
                        <p className="text-gray-400 text-sm">
                          ${entrada.precio.toLocaleString('es-CO')} cada una
                        </p>
                      </div>
                    </div>
                    <p className="text-white font-semibold">
                      ${(entrada.precio * entrada.cantidad).toLocaleString('es-CO')}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleEditarSeleccion}
                className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
              >
                Editar selección
              </button>
            </div>
          </div>

          {/* Total a Pagar */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800 p-6 rounded-lg sticky top-4">
              <h3 className="text-xl font-semibold text-white mb-4">Total a Pagar</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>COP {compra.subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Cargos por servicio</span>
                  <span>COP {compra.cargoServicio.toLocaleString('es-CO')}</span>
                </div>

                <div className="border-t border-neutral-700 pt-3">
                  <div className="flex justify-between text-white text-2xl font-bold">
                    <span>Total</span>
                    <span>COP {compra.total.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmarYPagar}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold mb-3 transition"
              >
                Confirmar y Pagar
              </button>

              <button
                onClick={handleCancelarReserva}
                className="w-full py-3 bg-transparent border border-neutral-600 hover:bg-neutral-700 text-white rounded-lg font-semibold transition"
              >
                Cancelar reserva
              </button>

              <div className="mt-6 flex items-center justify-center text-gray-400 text-sm">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Pago seguro y protegido
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
