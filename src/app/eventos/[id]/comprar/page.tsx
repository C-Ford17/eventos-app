// src/app/eventos/[id]/comprar/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SeleccionEntradasPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      router.push('/login');
    }
  }, [router]);

  // Datos del evento
  const evento = {
    nombre: 'Festival de Verano',
    fecha: '2024-08-25T20:00:00',
    lugar: 'Plaza Mayor',
  };

  const [entradas, setEntradas] = useState([
    {
      id: 1,
      nombre: 'Acceso General',
      precio: 50000,
      descripcion: 'Acceso general al evento.',
      cantidad: 0,
      disponibles: 100,
    },
    {
      id: 2,
      nombre: 'VIP',
      precio: 150000,
      descripcion: 'Incluye bebida de bienvenida y acceso a zona preferencial.',
      cantidad: 0,
      disponibles: 20,
    },
    {
      id: 3,
      nombre: 'Estudiante',
      precio: 35000,
      descripcion: 'Requiere carnet estudiantil válido. Unidades limitadas.',
      cantidad: 0,
      disponibles: 3,
    },
  ]);

  const handleIncrement = (id: number) => {
    setEntradas(entradas.map(e => 
      e.id === id && e.cantidad < e.disponibles 
        ? { ...e, cantidad: e.cantidad + 1 }
        : e
    ));
  };

  const handleDecrement = (id: number) => {
    setEntradas(entradas.map(e => 
      e.id === id && e.cantidad > 0 
        ? { ...e, cantidad: e.cantidad - 1 }
        : e
    ));
  };

  const subtotal = entradas.reduce((sum, e) => sum + (e.precio * e.cantidad), 0);
  const cargoServicio = subtotal * 0.1;
  const total = subtotal + cargoServicio;
  const totalEntradas = entradas.reduce((sum, e) => sum + e.cantidad, 0);

  const handleContinuar = () => {
    if (totalEntradas === 0) {
      alert('Selecciona al menos una entrada');
      return;
    }

    // Guarda la selección en localStorage
    const seleccion = {
      evento,
      entradas: entradas.filter(e => e.cantidad > 0),
      subtotal,
      cargoServicio,
      total,
    };
    localStorage.setItem('compraActual', JSON.stringify(seleccion));
    router.push(`/eventos/${eventoId}/comprar/confirmacion`);
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Selecciona tus Entradas</h1>
          <p className="text-gray-400">
            {evento.nombre} | {new Date(evento.fecha).toLocaleDateString('es-ES')} - {new Date(evento.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} | {evento.lugar}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de entradas */}
          <div className="lg:col-span-2 space-y-4">
            {entradas.map((entrada) => (
              <div key={entrada.id} className="bg-neutral-800 p-6 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-12 h-12 bg-blue-900 rounded flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {entrada.id === 1 && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          )}
                          {entrada.id === 2 && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          )}
                          {entrada.id === 3 && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{entrada.nombre}</h3>
                        <p className="text-2xl font-bold text-white">${entrada.precio.toLocaleString('es-CO')} <span className="text-sm text-gray-400">COP</span></p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">{entrada.descripcion}</p>
                    {entrada.disponibles < 10 && (
                      <p className="text-yellow-500 text-sm mt-2">
                        ⚠️ Solo quedan {entrada.disponibles} unidades
                      </p>
                    )}
                  </div>

                  {/* Selector de cantidad */}
                  <div className="flex items-center space-x-3 ml-4">
                    <button
                      onClick={() => handleDecrement(entrada.id)}
                      disabled={entrada.cantidad === 0}
                      className="w-10 h-10 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-white w-12 text-center">
                      {entrada.cantidad}
                    </span>
                    <button
                      onClick={() => handleIncrement(entrada.id)}
                      disabled={entrada.cantidad >= entrada.disponibles}
                      className="w-10 h-10 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {entradas.find(e => e.disponibles < 10) && (
              <div className="bg-orange-900/30 border border-orange-700 text-orange-200 px-4 py-3 rounded-lg flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm">
                  La entrada para Estudiante está casi agotada. ¡Quedan pocas unidades!
                </p>
              </div>
            )}
          </div>

          {/* Resumen de compra */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800 p-6 rounded-lg sticky top-4">
              <h2 className="text-xl font-semibold text-white mb-4">Resumen de tu compra</h2>

              {totalEntradas > 0 ? (
                <>
                  {entradas.filter(e => e.cantidad > 0).map((entrada) => (
                    <div key={entrada.id} className="flex justify-between text-gray-300 mb-2">
                      <span>{entrada.cantidad}x {entrada.nombre}</span>
                      <span>${(entrada.precio * entrada.cantidad).toLocaleString('es-CO')}</span>
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
