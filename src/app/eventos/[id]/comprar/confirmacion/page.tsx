'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Ticket, CheckCircle, XCircle, Shield, Clock } from 'lucide-react';

export default function ConfirmacionReservaPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id as string;

  const [compra, setCompra] = useState<any>(null);
  const [evento, setEvento] = useState<any>(null);

  useEffect(() => {
    const compraStr = localStorage.getItem('compraActual');
    if (!compraStr) {
      router.push(`/eventos/${eventoId}`);
      return;
    }
    setCompra(JSON.parse(compraStr));
  }, [eventoId, router]);

  useEffect(() => {
    if (compra && (!compra.evento.imagen_url || !compra.evento.categoria)) {
      fetch(`/api/eventos/${eventoId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setEvento(data.evento);
          }
        });
    }
  }, [compra, eventoId]);

  useEffect(() => {
    if (compra?.reservaId) {
      fetch(`/api/reservas/${compra.reservaId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCompra((prev: any) => ({
              ...prev,
              estado_reserva: data.reserva.estado_reserva,
            }));
          }
        });
    }
  }, [compra?.reservaId]);

  const handleEditarSeleccion = () => {
    router.back();
  };

  const handleCancelarReserva = () => {
    if (window.confirm('¿Estás seguro que deseas cancelar la reserva?')) {
      localStorage.removeItem('compraActual');
      router.push(`/eventos/${eventoId}`);
    }
  };

  const handleConfirmarYPagar = () => {
    router.push(`/eventos/${eventoId}/comprar/pago`);
  };

  if (!compra) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  const eventoInfo = evento || compra.evento;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="bg-[#1a1a1a]/60 border-b border-white/10 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors group relative z-10"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-white">Confirma tu reserva</h1>
          <p className="text-gray-400 mt-2">Revisa los detalles antes de proceder al pago</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Status Messages */}
        {compra.estado_reserva === 'pendiente' && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 flex items-center gap-3">
            <Clock size={20} />
            <p>Tu pago está pendiente de confirmación. Completa el pago para asegurar tu reserva.</p>
          </div>
        )}
        {compra.estado_reserva === 'confirmada' && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-200 flex items-center gap-3">
            <CheckCircle size={20} />
            <p>Tu reserva ha sido confirmada. ¡Gracias por tu compra!</p>
          </div>
        )}
        {compra.estado_reserva === 'cancelada' && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-center gap-3">
            <XCircle size={20} />
            <p>La reserva fue cancelada. Contacta soporte para mayor información.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info */}
            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl">
              <div className="flex flex-col md:flex-row gap-4">
                {eventoInfo.imagen_url && (
                  <img
                    src={eventoInfo.imagen_url}
                    alt={eventoInfo.nombre}
                    className="w-full md:w-32 h-32 object-cover rounded-xl"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-3">{eventoInfo.nombre}</h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar size={16} className="text-blue-400" />
                      <span className="text-sm">
                        {new Date(eventoInfo.fecha_inicio || eventoInfo.fecha).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })} - {new Date(eventoInfo.fecha_inicio || eventoInfo.fecha).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin size={16} className="text-purple-400" />
                      <span className="text-sm">{eventoInfo.ubicacion || eventoInfo.lugar}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Tickets */}
            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Entradas Seleccionadas</h3>
                <button onClick={handleEditarSeleccion} className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                  Editar selección
                </button>
              </div>
              <div className="space-y-3">
                {compra.entradas.map((entrada: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Ticket className="text-blue-400" size={20} />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {entrada.cantidad}x {entrada.nombre}
                        </p>
                        <p className="text-gray-400 text-sm">${entrada.precio.toLocaleString('es-CO')} cada una</p>
                      </div>
                    </div>
                    <p className="text-white font-semibold">
                      ${(entrada.precio * entrada.cantidad).toLocaleString('es-CO')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl sticky top-4">
              <h3 className="text-xl font-bold text-white mb-6">Resumen de Pago</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${compra.subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span className="text-sm">Cargos de servicio</span>
                  <span>${compra.cargoServicio.toLocaleString('es-CO')}</span>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between text-white font-bold text-xl">
                  <span>Total</span>
                  <span>${compra.total.toLocaleString('es-CO')}</span>
                </div>
              </div>

              <button
                onClick={handleConfirmarYPagar}
                disabled={compra.estado_reserva === 'confirmada' || compra.estado_reserva === 'cancelada'}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 hover:shadow-green-600/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-3"
              >
                Confirmar y Pagar
              </button>

              <button
                onClick={handleCancelarReserva}
                className="w-full py-3 bg-transparent border border-white/10 hover:bg-white/5 text-white rounded-xl font-medium transition-all"
              >
                Cancelar reserva
              </button>

              <div className="mt-6 flex items-center justify-center text-gray-400 text-sm">
                <Shield size={16} className="mr-2" />
                Pago seguro y protegido
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
