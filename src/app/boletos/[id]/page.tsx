// src/app/boletos/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { descargarQRImagen } from '@/lib/qr';
import { generarPDFBoleto } from '@/lib/pdf-boleto';

export default function BoletaQRPage() {
  const params = useParams();
  const router = useRouter();
  const [reserva, setReserva] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reservas/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReserva(data.reserva);
        }
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDescargarImagen = () => {
    if (reserva?.qrData) {
      // Regenerar QR desde los datos
      const qrDataURL = `data:image/png;base64,${reserva.qr_data}`;
      descargarQRImagen(qrDataURL, `boleto-${reserva.id}.png`);
    }
  };

  const handleDescargarPDF = () => {
    if (reserva) {
      generarPDFBoleto({
        evento: {
          nombre: reserva.evento.nombre,
          fecha: reserva.evento.fecha_inicio,
          lugar: reserva.evento.ubicacion,
        },
        entradas: [{
          nombre: 'Boletos',
          cantidad: reserva.cantidad_boletos,
          precio: parseFloat(reserva.precio_total) / reserva.cantidad_boletos,
        }],
        numeroOrden: Math.floor(Math.random() * 1000000),
        reservaId: reserva.id,
        fechaCompra: reserva.fecha_reserva,
        total: parseFloat(reserva.precio_total),
        qrDataURL: reserva.qrData || '',
        metodoPago: reserva.metodo_pago,
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
              <strong>Fecha:</strong> {new Date(reserva.evento.fecha_inicio).toLocaleDateString('es-ES')}
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
            <p className="text-center text-gray-800 font-mono text-sm mb-3">
              {reserva.id}
            </p>
            <p className="text-center text-gray-600 text-sm">
              Muestra este código en la entrada
            </p>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <button
              onClick={handleDescargarPDF}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
            >
              Descargar PDF
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
