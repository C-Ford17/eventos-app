'use client';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { XCircle, Home, HelpCircle, RefreshCw } from 'lucide-react';

export default function FalloCompraPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventoId = params.id;
  const processedRef = useRef(false);

  useEffect(() => {
    const external_reference = searchParams.get('external_reference');
    const status = searchParams.get('collection_status') || searchParams.get('status');

    // Solo marcar como rechazada si viene de MercadoPago con external_reference
    if (external_reference && external_reference !== 'null' && !processedRef.current) {
      processedRef.current = true;

      console.log('🔴 Marcando reserva como rechazada:', external_reference);

      // Llamar a la API para marcar como rechazado
      fetch('/api/reservas/marcar-rechazada', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservaId: external_reference }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('✅ Transacción marcada como rechazada:', data);
        })
        .catch((err) => {
          console.error('❌ Error al marcar transacción como rechazada:', err);
        });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Failure Header */}
      <div className="bg-gradient-to-br from-red-600/20 via-rose-600/10 to-transparent border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <XCircle className="text-white" size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Pago No Completado
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Hubo un problema al procesar tu pago. No te preocupes, no se realizó ningún cargo a tu cuenta.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Information Card */}
        <div className="bg-[#1a1a1a]/60 border border-white/10 p-8 rounded-2xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">¿Qué sucedió?</h2>
          <div className="space-y-4 text-gray-300">
            <p>El proceso de pago no se completó exitosamente. Esto puede deberse a:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fondos insuficientes en tu método de pago</li>
              <li>Datos de tarjeta incorrectos</li>
              <li>Cancelación manual del proceso</li>
              <li>Problemas de conexión con el procesador de pagos</li>
            </ul>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/eventos/${eventoId}`}
            className="group p-6 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all"
          >
            <RefreshCw className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
            <p className="text-white font-semibold mb-1">Intentar Nuevamente</p>
            <p className="text-gray-400 text-sm">Volver al evento y reintentar la compra</p>
          </Link>

          <Link
            href="/ayuda"
            className="group p-6 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-all"
          >
            <HelpCircle className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
            <p className="text-white font-semibold mb-1">Contactar Soporte</p>
            <p className="text-gray-400 text-sm">¿Necesitas ayuda? Estamos aquí</p>
          </Link>

          <Link
            href="/"
            className="group p-6 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 rounded-xl transition-all"
          >
            <Home className="text-gray-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
            <p className="text-white font-semibold mb-1">Volver al Inicio</p>
            <p className="text-gray-400 text-sm">Explorar otros eventos</p>
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-3">💡 Consejo</h3>
          <p className="text-gray-300 text-sm">
            Si el problema persiste, verifica que tu método de pago esté activo y tenga fondos suficientes.
            También puedes intentar con otro método de pago o contactar a tu banco.
          </p>
        </div>
      </div>
    </div>
  );
}
