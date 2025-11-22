'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Search, Filter, User, Ticket, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import CustomDropdown from '@/components/CustomDropdown';

export default function ReservasEventoPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id;
  const [reservas, setReservas] = useState<any[]>([]);
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch evento details
        const eventoRes = await fetch(`/api/eventos/${eventoId}`);
        const eventoData = await eventoRes.json();
        if (eventoData.success) {
          setEvento(eventoData.evento);
        }

        // Fetch reservas
        const reservasRes = await fetch(`/api/reservas?evento_id=${eventoId}`);
        const reservasData = await reservasRes.json();
        if (reservasData.success) {
          setReservas(reservasData.reservas);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (eventoId) {
      fetchData();
    }
  }, [eventoId]);

  const reservasFiltradas = reservas.filter(reserva => {
    const cumpleFiltro = filtroEstado === 'todos' || reserva.estado_reserva === filtroEstado;
    const cumpleBusqueda = reserva.asistente_id.toLowerCase().includes(busqueda.toLowerCase()) || // Idealmente buscar por nombre de usuario si estuviera disponible en el top level, pero está en asistente
      (reserva.numero_orden && reserva.numero_orden.toLowerCase().includes(busqueda.toLowerCase()));
    return cumpleFiltro && cumpleBusqueda;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmada':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1"><CheckCircle size={12} /> Confirmada</span>;
      case 'pendiente':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-1"><Clock size={12} /> Pendiente</span>;
      case 'cancelada':
      case 'rechazada':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1"><XCircle size={12} /> Cancelada</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Reservas del Evento</h1>
            {evento && <p className="text-gray-400 text-lg">{evento.nombre}</p>}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#1a1a1a] border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Buscar por número de orden..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-black/20 border border-white/10 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="relative md:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <CustomDropdown
              options={[
                { value: 'todos', label: 'Todos los estados' },
                { value: 'confirmada', label: 'Confirmadas' },
                { value: 'pendiente', label: 'Pendientes' },
                { value: 'cancelada', label: 'Canceladas' }
              ]}
              value={filtroEstado}
              onChange={(value) => setFiltroEstado(value)}
              buttonClassName="pl-12"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-black/20">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Orden</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Tipo Entrada</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Cantidad</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reservasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron reservas
                    </td>
                  </tr>
                ) : (
                  reservasFiltradas.map((reserva) => (
                    <tr key={reserva.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-blue-400">{reserva.numero_orden}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(reserva.fecha_reserva).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(reserva.fecha_reserva).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {reserva.tipoEntrada?.nombre || 'General'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {reserva.cantidad_boletos}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        ${reserva.precio_total.toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(reserva.estado_reserva)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
