// src/app/eventos/[id]/comprar/pago/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PagoPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id;
  const [compra, setCompra] = useState<any>(null);
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [procesando, setProcesando] = useState(false);

  // Datos del formulario de tarjeta
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    const compraStr = localStorage.getItem('compraActual');
    if (!compraStr) {
      router.push(`/eventos/${eventoId}`);
      return;
    }
    setCompra(JSON.parse(compraStr));
  }, [eventoId, router]);

  const handlePagar = async (e: React.FormEvent) => {
  e.preventDefault();
  setProcesando(true);

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.id) {
      alert('Debes iniciar sesión para continuar');
      router.push('/login');
      return;
    }

    // Simula procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calcula cantidad total de boletos
    const cantidadTotal = compra.entradas.reduce(
      (sum: number, e: any) => sum + e.cantidad,
      0
    );

    // Crea la reserva en la BD con la API
    const response = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evento_id: eventoId,
        usuario_id: user.id,
        cantidad_boletos: cantidadTotal,
        metodo_pago: metodoPago === 'tarjeta' 
          ? `Tarjeta terminada en ${numeroTarjeta.slice(-4)}` 
          : 'PSE',
        subtotal: compra.subtotal,
        cargo_servicio: compra.cargoServicio,
        total: compra.total,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Error al crear reserva');
    }

    // Guarda información completa para la página de éxito
    const compraFinalizada = {
      ...compra,
      numeroOrden: result.reserva.numeroOrden,
      reservaId: result.reserva.id,
      fechaCompra: result.reserva.fecha_reserva,
      metodoPago: metodoPago === 'tarjeta' 
        ? `Tarjeta terminada en ${numeroTarjeta.slice(-4)}` 
        : 'PSE',
      qrDataURL: result.reserva.qrDataURL,
      qrData: result.reserva.qrData,
    };

    localStorage.setItem('ultimaCompra', JSON.stringify(compraFinalizada));
    localStorage.removeItem('compraActual');
    router.push(`/eventos/${eventoId}/comprar/exito`);
  } catch (error: any) {
    console.error('Error:', error);
    alert(error.message || 'Hubo un error al procesar el pago. Intenta nuevamente.');
    setProcesando(false);
  }
};

  if (!compra) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header seguro */}
        <div className="flex items-center justify-center mb-8">
          <svg className="w-6 h-6 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <h1 className="text-3xl font-bold text-white">Finaliza tu Compra</h1>
        </div>
        <p className="text-center text-gray-400 mb-8">
          Tu pago es seguro y tus datos están protegidos.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de pago */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePagar} className="bg-neutral-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-6">Elige tu método de pago</h2>

              {/* Métodos de pago */}
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  onClick={() => setMetodoPago('tarjeta')}
                  className={`flex-1 py-3 px-4 rounded border-2 transition ${
                    metodoPago === 'tarjeta'
                      ? 'border-blue-500 bg-blue-900/30'
                      : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <p className="text-white font-medium">Tarjeta de Crédito/Débito</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMetodoPago('pse')}
                  className={`flex-1 py-3 px-4 rounded border-2 transition ${
                    metodoPago === 'pse'
                      ? 'border-blue-500 bg-blue-900/30'
                      : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <p className="text-white font-medium">PSE</p>
                </button>
              </div>

              {/* Formulario de tarjeta */}
              {metodoPago === 'tarjeta' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Número de la tarjeta</label>
                    <input
                      type="text"
                      value={numeroTarjeta}
                      onChange={(e) => setNumeroTarjeta(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                      placeholder="•••• •••• •••• ••••"
                      maxLength={19}
                      required
                      className="w-full px-4 py-3 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Nombre en la tarjeta</label>
                    <input
                      type="text"
                      value={nombreTarjeta}
                      onChange={(e) => setNombreTarjeta(e.target.value)}
                      placeholder="Juan Pérez"
                      required
                      className="w-full px-4 py-3 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Fecha de vencimiento</label>
                      <input
                        type="text"
                        value={fechaVencimiento}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setFechaVencimiento(value);
                        }}
                        placeholder="MM/AA"
                        maxLength={5}
                        required
                        className="w-full px-4 py-3 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">CVC</label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        maxLength={3}
                        required
                        className="w-full px-4 py-3 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PSE (simplificado) */}
              {metodoPago === 'pse' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Banco</label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecciona tu banco</option>
                      <option value="bancolombia">Bancolombia</option>
                      <option value="davivienda">Davivienda</option>
                      <option value="bbva">BBVA</option>
                      <option value="banco-bogota">Banco de Bogotá</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Tipo de persona</label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="natural">Persona Natural</option>
                      <option value="juridica">Persona Jurídica</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={procesando}
                className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {procesando ? 'Procesando pago...' : `Pagar $${compra.total.toLocaleString('es-CO')} COP`}
              </button>

              <div className="mt-4 text-center text-gray-400 text-sm flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Transacción segura encriptada con SSL
              </div>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800 p-6 rounded-lg sticky top-4">
              <h3 className="text-lg font-semibold text-white mb-4">Resumen del Pedido</h3>

              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-1">EVENTO MUSICAL 2024 - 15 DIC 2024</p>
                <h4 className="text-white font-medium">{compra.evento.nombre}</h4>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Cantidad de Entradas</span>
                  <span>{compra.entradas.reduce((sum: number, e: any) => sum + e.cantidad, 0)}</span>
                </div>
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Subtotal</span>
                  <span>${compra.subtotal.toLocaleString('es-CO')} COP</span>
                </div>
              </div>

              <div className="border-t border-neutral-700 pt-4">
                <div className="flex justify-between text-white font-bold text-lg mb-4">
                  <span>Total a Pagar</span>
                  <span>${compra.total.toLocaleString('es-CO')} COP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
