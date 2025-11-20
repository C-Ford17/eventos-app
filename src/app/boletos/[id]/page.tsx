// src/app/boletos/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { descargarQRImagen } from '@/lib/qr';
import { generarPDFBoleto } from '@/lib/pdf-boleto';

export default function BoletaQRPage() {
  const params = useParams();
  const router = useRouter();
  const [reserva, setReserva] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataURL, setQrDataURL] = useState<string>('');

  useEffect(() => {
    fetch(`/api/reservas/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReserva(data.reserva);

          // Generar QR desde el ID de la reserva
          QRCode.toDataURL(data.reserva.id, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          }).then(url => {
            setQrDataURL(url);
          });
        }
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDescargarImagen = () => {
    if (qrDataURL) {
      descargarQRImagen(qrDataURL, `boleto-${reserva.id}.png`);
    }
  };

  const handleDescargarPDF = () => {
    if (reserva && qrDataURL) {
      // Usar entradas del backend si existen, sino crear fallback

      const entradas = reserva.entradas || [{
        nombre: 'General',
        cantidad: reserva.cantidad_boletos,
        precio: parseFloat(reserva.precio_total) / reserva.cantidad_boletos,
      }];
      console.log("Reserva recibida:", JSON.stringify(reserva, null, 2));
      console.log("Entradas agrupadas:", JSON.stringify(entradas, null, 2));


      generarPDFBoleto({
        evento: {
          nombre: reserva.evento.nombre,
          fecha: reserva.evento.fecha_inicio,
          lugar: reserva.evento.ubicacion,
        },
        entradas: entradas,
        numeroOrden: reserva.numero_orden,
        reservaId: reserva.id,
        fechaCompra: reserva.fecha_reserva,
        total: parseFloat(reserva.precio_total),
        qrDataURL: qrDataURL,
        metodoPago: reserva.metodo_pago || 'Tarjeta',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Boleto no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tu Boleto Digital</h1>
          <p className="text-gray-400">Presenta este código QR en la entrada</p>
        </div>

        <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
          {/* Top Decoration */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                {reserva.evento.nombre}
              </h2>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">
                  {new Date(reserva.evento.fecha_inicio).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">
                  {new Date(reserva.evento.fecha_inicio).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-2xl mb-8 shadow-lg mx-auto max-w-[280px]">
              {qrDataURL ? (
                <div className="text-center">
                  <img
                    src={qrDataURL}
                    alt="Código QR"
                    className="w-full h-auto mb-2"
                  />
                  <p className="text-gray-900 font-mono text-xs font-bold tracking-wider break-all">
                    {reserva.id}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Ubicación</p>
                <p className="text-white font-medium text-sm line-clamp-2">{reserva.evento.ubicacion}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Boletos</p>
                <p className="text-white font-medium text-sm">{reserva.cantidad_boletos} Personas</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleDescargarPDF}
                disabled={!qrDataURL}
                className="w-full py-3.5 bg-white text-black hover:bg-gray-100 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar PDF
              </button>

              <button
                onClick={handleDescargarImagen}
                disabled={!qrDataURL}
                className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Guardar QR
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/dashboard/asistente/reservas"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a mis reservas
          </Link>
        </div>
      </div>
    </div>
  );
}
