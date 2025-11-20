'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shield, CreditCard, Loader2, Calendar, MapPin, Ticket, ArrowLeft } from 'lucide-react';
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
          tipo_entrada_id: compra.entradas[0]?.id,
        }),
      });
      const reservarData = await reservarRes.json();
      if (!reservarRes.ok || !reservarData.success) {
        throw new Error(reservarData.error || 'Error al crear reserva');
      }
      const reservaId = reservarData.reserva.id;
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-400 animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }
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
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-green-500" size={32} />
            <h1 className="text-3xl font-bold text-white">Pago Seguro</h1>
          </div>
          <p className="text-gray-400">Serás redirigido a MercadoPago para completar tu compra</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Action */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePagar} className="bg-[#1a1a1a]/60 border border-white/10 p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <CreditCard className="text-blue-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">Método de Pago</h2>
              </div>
              <div className="bg-black/20 border border-white/5 p-6 rounded-xl mb-6">
                <p className="text-gray-300 mb-4">
                  Al hacer clic en "Proceder al Pago", serás redirigido a MercadoPago donde podrás completar tu compra de forma segura usando:
                </p>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    Tarjetas de crédito y débito
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    PSE (Pagos Seguros en Línea)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    Efectivo en puntos autorizados
                  </li>
                </ul>
              </div>
              <button
                type="submit"
                disabled={procesando}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {procesando ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Redirigiendo...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Proceder al Pago - ${compra.total.toLocaleString('es-CO')}
                  </>
                )}
              </button>
              <div className="mt-6 flex items-center justify-center text-gray-400 text-sm">
                <Shield size={16} className="mr-2 text-green-500" />
                Pago 100% seguro y protegido con MercadoPago
              </div>
            </form>
          </div>
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl sticky top-4">
              <h3 className="text-xl font-bold text-white mb-6">Resumen de Compra</h3>
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">{compra.evento.nombre}</h4>
                {compra.evento.fecha_inicio && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Calendar size={16} className="text-blue-400" />
                    <span>
                      {new Date(compra.evento.fecha_inicio).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })} - {new Date(compra.evento.fecha_inicio).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                {compra.evento.ubicacion && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MapPin size={16} className="text-purple-400" />
                    <span>{compra.evento.ubicacion}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                {compra.entradas.map((entrada: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Ticket size={14} className="text-gray-500" />
                      <span className="text-gray-300">{entrada.cantidad}x {entrada.nombre}</span>
                    </div>
                    <span className="text-white">${(entrada.precio * entrada.cantidad).toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Subtotal</span>
                  <span>${compra.subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Cargo de servicio</span>
                  <span>${compra.cargoServicio.toLocaleString('es-CO')}</span>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between text-white font-bold text-xl">
                  <span>Total</span>
                  <span>${compra.total.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}