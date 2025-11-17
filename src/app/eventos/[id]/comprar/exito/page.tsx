'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { descargarQRImagen } from '@/lib/qr';
import { generarPDFBoleto } from '@/lib/pdf-boleto';

export default function ExitoCompraPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventoId = params.id;
  const router = useRouter();

  const [compra, setCompra] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SIEMPRE da prioridad a buscar por collection_id de query
    const collection_id = searchParams.get('collection_id');
    if (collection_id) {
      fetch(`/api/reservas/buscar?mp_collection_id=${collection_id}`)
        .then(res => res.json())
        .then(data => {
          setCompra(data.reserva || null);
          setLoading(false);
        })
        .catch(() => setLoading(false));
      return;
    }
    // Si no hay parámetro de MP, busca en localStorage (flujo clásico)
    const compraStr = localStorage.getItem('ultimaCompra');
    if (compraStr) {
      setCompra(JSON.parse(compraStr));
    }
    setLoading(false);
  }, [eventoId, searchParams]);

  const handleDescargarImagen = () => {
    if (compra?.qrDataURL) {
      descargarQRImagen(compra.qrDataURL, `boleto-${compra.reservaId}.png`);
    }
  };

  const handleDescargarPDF = () => {
    if (compra) {
      generarPDFBoleto({
        evento: compra.evento,
        entradas: compra.entradas,
        numeroOrden: compra.numeroOrden,
        reservaId: compra.reservaId,
        fechaCompra: compra.fechaCompra,
        total: compra.total,
        qrDataURL: compra.qrDataURL,
        metodoPago: compra.metodoPago,
      });
    }
  };

  const handleAgregarCalendario = () => {
    if (!compra) return;
    const evento = compra.evento;
    const fechaInicio = new Date(evento.fecha).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const fechaFin = new Date(new Date(evento.fecha).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${fechaInicio}`,
      `DTEND:${fechaFin}`,
      `SUMMARY:${evento.nombre}`,
      `DESCRIPTION:Evento confirmado - Boleto: ${compra.reservaId}`,
      `LOCATION:${evento.lugar}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evento-${compra.reservaId}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (!compra) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          No se encontró información de la compra.
        </h1>
        <Link href="/dashboard/asistente/boletos" className="text-blue-500 hover:underline">
          Ver mis boletos
        </Link>
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
                <p className="text-white font-medium">{compra.evento?.nombre || 'Evento'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Fecha</p>
                <p className="text-white">
                  {compra.evento?.fecha_inicio || compra.evento?.fecha
                    ? (
                      <>
                        {new Date(compra.evento.fecha_inicio || compra.evento.fecha).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        , {new Date(compra.evento.fecha_inicio || compra.evento.fecha).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </>
                    )
                    : "Fecha no disponible"
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Ubicación</p>
                <p className="text-white">
                  {compra.evento?.ubicacion || compra.evento?.lugar || "Lugar no disponible"}
                </p>
              </div>
              <div className="border-t border-neutral-700 pt-3">
                <p className="text-gray-400 text-sm mb-2">Entradas</p>
                {compra.entradas?.map((entrada: any, index: number) => (
                  <p key={index} className="text-white">
                    {entrada.cantidad}x {entrada.nombre}
                  </p>
                ))}
              </div>
              <div className="border-t border-neutral-700 pt-3">
                <p className="text-gray-400 text-sm">Total Pagado</p>
                <p className="text-white text-2xl font-bold">
                  ${compra.total?.toLocaleString('es-CO')}
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
            <div className="bg-white p-6 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                {compra.qrDataURL ? (
                  <>
                    <img
                      src={compra.qrDataURL}
                      alt="Código QR"
                      className="w-48 h-48 mx-auto mb-3"
                    />
                    <p className="text-gray-800 font-mono text-xs break-all px-4">
                      {compra.reservaId}
                    </p>
                  </>
                ) : (
                  <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Error al cargar QR</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleDescargarPDF}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar Boleto PDF
              </button>
              <button
                onClick={handleDescargarImagen}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Descargar Solo QR
              </button>
            </div>
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
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            ¿Necesitas ayuda? <Link href="/ayuda" className="text-blue-400 hover:text-blue-300">Contacta a Soporte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
