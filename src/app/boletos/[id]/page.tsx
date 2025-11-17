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
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Tu Boleto
        </h1>

        <div className="bg-neutral-800 p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            {reserva.evento.nombre}
          </h2>
          
          <div className="space-y-2 mb-6">
            <p className="text-gray-300">
              <strong>Fecha:</strong> {new Date(reserva.evento.fecha_inicio).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-gray-300">
              <strong>Lugar:</strong> {reserva.evento.ubicacion}
            </p>
            <p className="text-gray-300">
              <strong>Boletos:</strong> {reserva.cantidad_boletos}
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-white p-6 rounded-lg mb-6">
            {qrDataURL ? (
              <div className="text-center">
                <img 
                  src={qrDataURL} 
                  alt="Código QR" 
                  className="w-64 h-64 mx-auto mb-3"
                />
                <p className="text-gray-800 font-mono text-xs break-all px-4">
                  {reserva.id}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Muestra este código en la entrada
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <button
              onClick={handleDescargarPDF}
              disabled={!qrDataURL}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar PDF
            </button>
            
            <button
              onClick={handleDescargarImagen}
              disabled={!qrDataURL}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Descargar Solo QR
            </button>

            <Link
              href="/dashboard/asistente/boletos"
              className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-semibold transition block text-center"
            >
              Volver a mis boletos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
