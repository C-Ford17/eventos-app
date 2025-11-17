'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { descargarQRImagen } from '@/lib/qr';
import { generarPDFBoleto } from '@/lib/pdf-boleto';

export default function ExitoCompraPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventoId = params.id;
  const router = useRouter();

  const [compra, setCompra] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Centralizamos el fetch para marcar confirmada
  function marcarReservaComoConfirmada(reservaId: string, paymentId: string | null, metodoPago: string | null, estado: string | null) {
    if (!reservaId || !estado || estado !== 'approved') return;
    fetch('/api/reservas/marcar-confirmada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservaId,
        paymentId,
        metodoPago,
        estado,
      }),
    })
      .then(async res => {
        const data = await res.json();
        if (res.ok && data.reserva) {
          setCompra((prev : any) => ({
            ...prev,
            metodoPago: data.reserva.metodo_pago,
            estado_transaccion: data.reserva.estado_reserva,
            total: data.reserva.precio_total, // por si quieres refrescar total también
          }));
        }
        console.log("Reserva actualizada desde éxito:", data, res.status);
      })
      .catch(err => console.error('Error al marcar confirmada:', err));
  }

  useEffect(() => {
    const collection_id = searchParams.get('collection_id');
    const external_reference = searchParams.get('external_reference');
    const status = searchParams.get('collection_status') || searchParams.get('status');
    const payment_type = searchParams.get('payment_type');
    const payment_id = searchParams.get('payment_id');

    // Prioridad 1: Buscar por external_reference (backend)
    if (external_reference && external_reference !== 'null') {
      buscarPorExternalReference(external_reference, status, payment_type, payment_id);
      return;
    }

    // Prioridad 2: Buscar por collection_id (backend)
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

    // Prioridad 3: Si hay datos en searchParams, armar compra manual (fallback)
    if (external_reference && status && payment_type) {
      setCompra({
        reservaId: external_reference,
        evento: { nombre: 'Evento desconocido', fecha: '', lugar: '' },
        entradas: [{ nombre: 'General', cantidad: 1, precio: 0 }],
        numeroOrden: payment_id || '',
        fechaCompra: new Date().toISOString(),
        total: 0,
        subtotal: 0,
        cargoServicio: 0,
        metodoPago: payment_type,
        qrDataURL: null,
        qrString: external_reference, // Mostrará el id como QR solo para referencia rápida
      });
      setLoading(false);

      // Marcar siempre si el estado es aprobado
      marcarReservaComoConfirmada(
        external_reference,
        payment_id ?? null,
        payment_type ?? null,
        status ?? null
      );
      return;
    }

    // Prioridad 4: Fallback localStorage
    const compraStr = localStorage.getItem('ultimaCompra');
    if (compraStr) {
      setCompra(JSON.parse(compraStr));
    }
    setLoading(false);
  }, [searchParams]);

  // Genera el QR dataURL en frontend si solo tienes el código plano
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
    // Intenta preferir un base64, si no tienes uno toma el código plano y se generará luego el QR
    const rawQR = reserva.credencialesAcceso?.[0]?.codigo_qr || reserva.id;
    const dataUrl = rawQR && rawQR.startsWith('data:image') ? rawQR : null;
    const precioUnitario = reserva.cantidad_boletos ? reserva.precio_total / reserva.cantidad_boletos : reserva.precio_total;
    const compraTransformada = {
      reservaId: reserva.id,
      evento: {
        nombre: reserva.evento?.nombre || 'Evento',
        fecha: reserva.evento?.fecha_inicio || '',
        lugar: reserva.evento?.ubicacion || '',
      },
      entradas: reserva.credencialesAcceso?.map((c: any) => ({
        nombre: c.tipo_entrada || 'Entrada General',
        cantidad: 1,
        precio: precioUnitario,
      })) || [{
        nombre: 'General',
        cantidad: reserva.cantidad_boletos || 1,
        precio: precioUnitario,
      }],
      numeroOrden: reserva.numero_orden || `orden-${Math.floor(Math.random() * 1000000)}`,
      fechaCompra: reserva.fecha_reserva,
      total: reserva.precio_total,
      subtotal: reserva.subtotal || reserva.precio_total,
      cargoServicio: reserva.cargo_servicio || 0,
      metodoPago: reserva.pagos?.[0]?.metodo_pago || payment_type || 'Pendiente',
      qrDataURL: dataUrl,
      qrString: !dataUrl ? rawQR : null,
      estado_transaccion: reserva.pagos?.[0]?.estado_transaccion // para validación
    };
    setCompra(compraTransformada);
    setLoading(false);

    // Si finalmente es aprobado (ya sea desde backend o searchparam), siempre confirmar
    if (
      (status === 'approved' || compraTransformada.estado_transaccion === 'approved') &&
      reserva.id
    ) {
      marcarReservaComoConfirmada(
        reserva.id,
        payment_id ?? null,        // <-- así conviertes undefined => null
        payment_type || compraTransformada.metodoPago,
        status || compraTransformada.estado_transaccion
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
      entradas: compra.entradas?.length > 0 ? compra.entradas : [{
        nombre: 'Entrada General',
        cantidad: 1,
        precio: compra.total || 0,
      }],
      numeroOrden: compra.numeroOrden ? Number(compra.numeroOrden) : Math.floor(Math.random() * 1000000),
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
  
  function formatCOP(valor: number | string | null | undefined) {
  if (!valor) return "COP $0";
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  return num.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });
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
                <p className="text-white">{formatCOP(compra.total)}</p>
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
                    <p className="text-gray-500 text-sm">Generando código QR...</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleDescargarPDF}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center"
                disabled={!compra.qrDataURL}
              >
                Descargar Boleto PDF
              </button>
              <button
                onClick={handleDescargarImagen}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center"
                disabled={!compra.qrDataURL}
              >
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
