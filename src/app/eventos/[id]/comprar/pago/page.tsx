'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PagoPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id;
  const [compra, setCompra] = useState<any>(null);
  const [procesando, setProcesando] = useState(false);

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

    // En el handlePagar, cambia esta parte:
    const reservarRes = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evento_id: eventoId,
        usuario_id: user.id,
        cantidad_boletos: compra.entradas.reduce((sum: number, e: any) => sum + e.cantidad, 0),
        metodo_pago: 'pendiente',
        subtotal: compra.subtotal,
        cargo_servicio: compra.cargoServicio,
        total: compra.total,
        tipo_entrada_id: compra.entradas[0]?.id, // <-- AGREGA ESTA LÍNEA
      }),
    });


    const reservarData = await reservarRes.json();
    if (!reservarRes.ok || !reservarData.success) {
      throw new Error(reservarData.error || 'Error al crear reserva');
    }

    const reservaId = reservarData.reserva.id;

    // 2. Crear preferencia MercadoPago y redirigir
    const response = await fetch('/api/pago-mercadopago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventoId,
        descripcion: `Compra entradas - ${compra.evento.nombre}`,
        monto: compra.total,
        referencia: reservaId,
        email: user.email,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.init_point) {
      throw new Error(data.error || 'Error creando preferencia');
    }

    window.location.href = data.init_point;
  } catch (error: any) {
    alert(error.message || 'Error procesando pago');
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
          Serás redirigido a MercadoPago para completar el pago de forma segura.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Acción de pago */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePagar} className="bg-neutral-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-6">Pago en MercadoPago</h2>
              <div className="mb-6">
                <p className="text-gray-300">
                  Al hacer clic en "Pagar", serás transferido a la pasarela de MercadoPago. Podrás usar tarjeta, débito o PSE.
                </p>
              </div>
              <button
                type="submit"
                disabled={procesando}
                className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {procesando ? 'Redirigiendo...' : `Pagar $${compra.total.toLocaleString('es-CO')} COP`}
              </button>
              <div className="mt-4 text-center text-gray-400 text-sm flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Pago seguro y protegido con MercadoPago
              </div>
            </form>
          </div>
          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800 p-6 rounded-lg sticky top-4">
              <h3 className="text-lg font-semibold text-white mb-4">Resumen del Pedido</h3>
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">{compra.evento.nombre}</h4>
                {/* Fecha del evento */}
                {compra.evento.fecha_inicio && (
                  <div className="flex items-center text-gray-400 text-sm mb-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(compra.evento.fecha_inicio).toLocaleDateString('es-ES', { 
                      weekday: 'short',
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
                {/* Ubicación del evento */}
                {compra.evento.ubicacion && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {compra.evento.ubicacion}
                  </div>
                )}
              </div>
              <div className="space-y-2 mb-4 border-t border-neutral-700 pt-4">
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Cantidad de Entradas</span>
                  <span>{compra.entradas.reduce((sum: number, e: any) => sum + e.cantidad, 0)}</span>
                </div>
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Subtotal</span>
                  <span>${compra.subtotal.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Cargo por servicio</span>
                  <span>${compra.cargoServicio.toLocaleString('es-CO')} COP</span>
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
