// src/app/eventos/[id]/comprar/exito/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ExitoCompraPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id;
  const [compra, setCompra] = useState<any>(null);

  useEffect(() => {
    const compraStr = localStorage.getItem('ultimaCompra');
    if (!compraStr) {
      router.push(`/eventos/${eventoId}`);
      return;
    }
    setCompra(JSON.parse(compraStr));
  }, [eventoId, router]);

  const handleDescargarBoleto = () => {
    alert('Descargando boleto... (funcionalidad pendiente)');
  };

  const handleAgregarCalendario = () => {
    alert('Agregando al calendario... (funcionalidad pendiente)');
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Ícono de éxito */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white text-center mb-2">
          ¡Gracias por tu compra!
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Hemos enviado un recibo a tu correo electrónico.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumen de la Compra */}
          <div className="bg-neutral-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Resumen de la Compra</h2>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Evento</p>
                <p className="text-white font-medium">{compra.evento.nombre}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Fecha y Hora</p>
                <p className="text-white">
                  {new Date(compra.evento.fecha).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}, {new Date(compra.evento.fecha).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Lugar</p>
                <p className="text-white">{compra.evento.lugar}</p>
              </div>

              <div className="border-t border-neutral-700 pt-3">
                <p className="text-gray-400 text-sm mb-2">Entradas</p>
                {compra.entradas.map((entrada: any, index: number) => (
                  <p key={index} className="text-white">
                    {entrada.cantidad}x {entrada.nombre}
                  </p>
                ))}
              </div>

              <div className="border-t border-neutral-700 pt-3">
                <p className="text-gray-400 text-sm">Total Pagado</p>
                <p className="text-white text-2xl font-bold">
                  ${compra.total.toLocaleString('es-CO')}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Método de Pago</p>
                <p className="text-white">{compra.metodoPago}</p>
              </div>
            </div>
          </div>

          {/* Tu Entrada (QR) */}
          <div className="bg-neutral-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">Tu Entrada</h2>
            <p className="text-center text-gray-400 text-sm mb-6">
              Escanea este código en el acceso.
            </p>

            {/* QR Code placeholder */}
            <div className="bg-white p-6 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="w-48 h-48 bg-gray-200 mx-auto mb-3 flex items-center justify-center rounded">
                  <div className="text-center">
                    <svg className="w-32 h-32 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
                    </svg>
                    <p className="text-gray-500 text-xs mt-2">QR Code</p>
                  </div>
                </div>
                <p className="text-gray-800 font-mono text-sm">
                  {compra.codigoQR}
                </p>
              </div>
            </div>

            <button
              onClick={handleDescargarBoleto}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold mb-3 transition flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar
            </button>
          </div>
        </div>

        {/* Próximos Pasos */}
        <div className="mt-8 bg-neutral-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Próximos Pasos</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/asistente/boletos"
              className="flex items-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              <svg className="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <div>
                <p className="text-white font-semibold">Ver mis Entradas</p>
                <p className="text-blue-200 text-sm">Accede a todos tus boletos</p>
              </div>
            </Link>

            <button
              onClick={handleAgregarCalendario}
              className="flex items-center p-4 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition"
            >
              <svg className="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-white font-semibold">Añadir al Calendario</p>
                <p className="text-gray-400 text-sm">No te pierdas el evento</p>
              </div>
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            ¿Necesitas ayuda? <Link href="/ayuda" className="text-blue-400 hover:text-blue-300">Contacta a Soporte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
