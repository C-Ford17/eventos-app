'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { descargarQRImagen } from '@/lib/qr';
import { generarPDFBoleto } from '@/lib/pdf-boleto';
import { CheckCircle, Download, Calendar, MapPin, Ticket, FileText, Home, Loader2 } from 'lucide-react';

export default function ExitoCompraPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventoId = params.id;
  const router = useRouter();

  const [compra, setCompra] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  function marcarReservaComoConfirmada(reservaId: string, paymentId: string | null, metodoPago: string | null, estado: string | null) {
    if (!reservaId || !estado || estado !== 'approved') return;
    fetch('/api/reservas/marcar-confirmada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservaId, paymentId, metodoPago, estado }),
    })
      .then(async res => {
        const data = await res.json();
        if (res.ok && data.reserva) {
          setCompra((prev: any) => ({
            ...prev,
            metodoPago: data.reserva.metodo_pago,
            estado_transaccion: data.reserva.estado_reserva,
            total: data.reserva.precio_total,
          }));
        }
      })
      .catch(err => console.error('Error al marcar confirmada:', err));
  }

  useEffect(() => {
    const collection_id = searchParams.get('collection_id');
    const external_reference = searchParams.get('external_reference');
    const status = searchParams.get('collection_status') || searchParams.get('status');
    const payment_type = searchParams.get('payment_type');
    const payment_id = searchParams.get('payment_id');

    if (external_reference && external_reference !== 'null') {
      buscarPorExternalReference(external_reference, status, payment_type, payment_id);
      return;
    }

    if (collection_id && collection_id !== 'null') {
      fetch(`/api/reservas/buscar?mp_collection_id=${collection_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.reserva) {
            transformarYSetCompra(data.reserva, status, payment_type, payment_id);
          } else {
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
      return;
    }

    const compraStr = localStorage.getItem('ultimaCompra');
    if (compraStr) {
      setCompra(JSON.parse(compraStr));
    }
    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    if (compra && !compra.qrDataURL && compra.qrString) {
      QRCode.toDataURL(compra.qrString, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      }).then(url =>
        setCompra((prev: any) => ({ ...prev, qrDataURL: url }))
      );
    }
  }, [compra]);

  function transformarYSetCompra(reserva: any, status?: string | null, payment_type?: string | null, payment_id?: string | null) {
    const rawQR = reserva.qr_data || reserva.id;
    const dataUrl = rawQR && rawQR.startsWith('data:image') ? rawQR : null;
    const entradas = reserva.entradas || [{
      nombre: 'General',
      cantidad: reserva.cantidad_boletos || 1,
      precio: 0
    }];

    const compraData = {
      reservaId: reserva.id,
      evento: {
        nombre: reserva.evento?.nombre || 'Evento',
        fecha: reserva.evento?.fecha_inicio || reserva.evento?.fecha || new Date().toISOString(),
        lugar: reserva.evento?.ubicacion || reserva.evento?.lugar || '',
      },
      entradas,
      numeroOrden: reserva.numero_orden,
      fechaCompra: reserva.fecha_reserva || new Date().toISOString(),
      total: Number(reserva.precio_total) || 0,
      subtotal: Number(reserva.subtotal) || Number(reserva.precio_total) || 0,
      cargoServicio: Number(reserva.cargo_servicio) || 0,
      metodoPago: reserva.metodo_pago || payment_type || 'Pendiente',
      qrDataURL: dataUrl,
      qrString: !dataUrl ? rawQR : null,
      estado_transaccion: reserva.pagos?.[0]?.estado_transaccion || null,
    };

    setCompra(compraData);
    localStorage.setItem('ultimaCompra', JSON.stringify(compraData));

    setLoading(false);

    if ((status === 'approved' || reserva.pagos?.[0]?.estado_transaccion === 'approved') && reserva.id) {
      marcarReservaComoConfirmada(
        reserva.id,
        payment_id ?? null,
        payment_type || reserva.metodo_pago,
        status || reserva.pagos?.[0]?.estado_transaccion,
      );
    }
  }

  function buscarPorExternalReference(reservaId: string | null, status?: string | null, payment_type?: string | null, payment_id?: string | null) {
    if (!reservaId || reservaId === 'null') {
      setLoading(false);
      return;
    }
    fetch(`/api/reservas/${reservaId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.reserva) {
          transformarYSetCompra(data.reserva, status, payment_type, payment_id);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }

  const handleDescargarImagen = () => {
    if (compra?.qrDataURL) {
      descargarQRImagen(compra.qrDataURL, `boleto-${compra.reservaId}.png`);
    }
  };

  const handleDescargarPDF = () => {
    if (compra && compra.qrDataURL) {
      generarPDFBoleto({
        evento: {
          nombre: compra.evento?.nombre || 'Evento',
          fecha: compra.evento?.fecha || compra.evento?.fecha_inicio || new Date().toISOString(),
          lugar: compra.evento?.lugar || compra.evento?.ubicacion || 'Ubicación no disponible',
        },
        entradas: compra.entradas,
        numeroOrden: compra.numeroOrden,
        reservaId: compra.reservaId || 'sin-id',
        fechaCompra: compra.fechaCompra || new Date().toISOString(),
        total: Number(compra.total) || 0,
        qrDataURL: compra.qrDataURL,
        metodoPago: compra.metodoPago || 'Desconocido',
      });
    }
  };

  const handleAgregarCalendario = () => {
    if (!compra) return;
    const evento = compra.evento;
    if (!evento || !evento.fecha || !evento.nombre) {
      alert("Datos del evento incompletos para agregar al calendario.");
      return;
    }
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
          <p className="text-gray-400 animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!compra) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4 text-red-400">
          No se encontró información de la compra.
        </h1>
        <Link href="/dashboard/asistente/reservas" className="text-blue-400 hover:text-blue-300 transition-colors">
          Ver mis reservas
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Success Header */}
      <div className="bg-gradient-to-br from-green-600/20 via-emerald-600/10 to-transparent border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="text-white" size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ¡Compra Exitosa!
          </h1>
          <p className="text-gray-300 text-lg">
            Tu reserva ha sido confirmada. Hemos enviado un recibo a tu correo electrónico.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-[#1a1a1a]/60 border border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Resumen de Compra</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Evento</p>
                <p className="text-white font-semibold text-lg">{compra.evento?.nombre || 'Evento'}</p>
              </div>
              {compra.evento?.fecha && (
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Fecha</p>
                    <p className="text-white">
                      {new Date(compra.evento.fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })} - {new Date(compra.evento.fecha).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
              {compra.evento?.lugar && (
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Ubicación</p>
                    <p className="text-white">{compra.evento.lugar}</p>
                  </div>
                </div>
              )}
              <div className="border-t border-white/10 pt-4">
                <p className="text-gray-400 text-sm mb-3">Entradas</p>
                {compra.entradas?.map((entrada: any, index: number) => (
                  <div key={index} className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Ticket size={16} className="text-blue-400" />
                      <span className="text-white">{entrada.cantidad}x {entrada.nombre}</span>
                    </div>
                    <span className="text-gray-300">${(entrada.precio * entrada.cantidad).toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-400">Total Pagado</span>
                  <span className="text-green-400">${compra.total?.toLocaleString('es-CO')}</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">Método: {compra.metodoPago}</p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-[#1a1a1a]/60 border border-white/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Tu Boleto</h2>
            <p className="text-center text-gray-400 text-sm mb-6">
              Presenta este código QR en el acceso al evento
            </p>
            <div className="bg-white p-6 rounded-xl mb-6">
              {compra.qrDataURL ? (
                <div className="text-center">
                  <img
                    src={compra.qrDataURL}
                    alt="QR Code"
                    className="w-64 h-64 mx-auto mb-3"
                  />
                  <p className="text-gray-800 font-mono text-xs break-all px-4">
                    #{compra.reservaId}
                  </p>
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-200 flex items-center justify-center mx-auto">
                  <p className="text-gray-500">Generando QR...</p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <button
                onClick={handleDescargarPDF}
                disabled={!compra.qrDataURL}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileText size={20} />
                Descargar Boleto PDF
              </button>
              <button
                onClick={handleDescargarImagen}
                disabled={!compra.qrDataURL}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download size={20} />
                Descargar Solo QR
              </button>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-[#1a1a1a]/60 border border-white/10 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold text-white mb-6">Próximos Pasos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/asistente/reservas"
              className="group p-6 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all"
            >
              <Ticket className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
              <p className="text-white font-semibold mb-1">Ver Mis Reservas</p>
              <p className="text-gray-400 text-sm">Accede a todas tus reservas</p>
            </Link>
            <button
              onClick={handleAgregarCalendario}
              className="group p-6 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-all text-left"
            >
              <Calendar className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
              <p className="text-white font-semibold mb-1">Añadir al Calendario</p>
              <p className="text-gray-400 text-sm">No te pierdas el evento</p>
            </button>
            <Link
              href="/"
              className="group p-6 bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 rounded-xl transition-all"
            >
              <Home className="text-gray-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
              <p className="text-white font-semibold mb-1">Explorar Más Eventos</p>
              <p className="text-gray-400 text-sm">Descubre nuevas experiencias</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
