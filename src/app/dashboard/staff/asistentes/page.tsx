// src/app/dashboard/staff/asistentes/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useStaff } from '@/contexts/StaffContext';
import EventoSelector from '@/components/EventoSelector';
import { Search, Filter, Download, CheckCircle, XCircle, Users, Mail, Ticket, ChevronDown } from 'lucide-react';

interface Asistente {
  id: string;
  nombre: string;
  email: string;
  cantidad_boletos: number;
  codigo_qr: string;
  estado_validacion: string;
  fecha_validacion: string | null;
  precio_total: number;
}

export default function ListaAsistentesPage() {
  const { eventoSeleccionado } = useStaff();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [asistentes, setAsistentes] = useState<Asistente[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventoSeleccionado) {
      cargarAsistentes();
    }
  }, [eventoSeleccionado]);

  const cargarAsistentes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/eventos/${eventoSeleccionado}/asistentes`);
      const data = await response.json();

      if (data.success) {
        setAsistentes(data.asistentes);
      }
    } catch (error) {
      console.error('Error cargando asistentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const asistentesFiltrados = asistentes.filter(asistente => {
    const matchBusqueda =
      asistente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      asistente.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      asistente.codigo_qr.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstado =
      filtroEstado === 'todos' ||
      asistente.estado_validacion === filtroEstado;

    return matchBusqueda && matchEstado;
  });

  const totalValidados = asistentes.filter(a => a.estado_validacion === 'validado').length;
  const totalPendientes = asistentes.filter(a => a.estado_validacion === 'pendiente').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Lista de Asistentes</h1>
      </div>

      {/* Selector de evento */}
      <EventoSelector />

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -mr-12 -mt-12 transition-all group-hover:bg-blue-500/20"></div>
          <p className="text-gray-400 text-sm font-medium mb-2">Total Registrados</p>
          <p className="text-4xl font-bold text-white">{asistentes.length}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-400">
            <Users size={16} />
            <span>Asistentes en lista</span>
          </div>
        </div>
        <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-xl -mr-12 -mt-12 transition-all group-hover:bg-green-500/20"></div>
          <p className="text-gray-400 text-sm font-medium mb-2">Validados</p>
          <p className="text-4xl font-bold text-white">{totalValidados}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
            <CheckCircle size={16} />
            <span>Ya ingresaron</span>
          </div>
        </div>
        <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-yellow-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl -mr-12 -mt-12 transition-all group-hover:bg-yellow-500/20"></div>
          <p className="text-gray-400 text-sm font-medium mb-2">Pendientes</p>
          <p className="text-4xl font-bold text-white">{totalPendientes}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-yellow-400">
            <Download size={16} />
            <span>Por ingresar</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 text-white rounded-xl border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600"
            />
          </div>
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-white/5 text-white rounded-xl border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all"
            >
              <option value="todos" className="bg-neutral-900">Todos los estados</option>
              <option value="validado" className="bg-neutral-900">Validados</option>
              <option value="pendiente" className="bg-neutral-900">Pendientes</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Tabla de asistentes */}
          <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Boletos
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Código QR
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Hora Validación
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {asistentesFiltrados.map((asistente) => (
                    <tr key={asistente.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                            {asistente.nombre.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{asistente.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          {asistente.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        <div className="flex items-center gap-2">
                          <Ticket size={14} className="text-purple-400" />
                          {asistente.cantidad_boletos}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-mono text-xs bg-white/5 px-2 py-1 rounded">
                        {asistente.codigo_qr.substring(0, 12)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {asistente.estado_validacion === 'validado' ? (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-xs rounded-full font-medium flex items-center gap-1 w-fit">
                            <CheckCircle size={12} />
                            Validado
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs rounded-full font-medium flex items-center gap-1 w-fit">
                            <Download size={12} />
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                        {asistente.fecha_validacion
                          ? new Date(asistente.fecha_validacion).toLocaleTimeString('es-ES')
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {asistentesFiltrados.length === 0 && (
            <div className="text-center py-20 bg-[#1a1a1a]/40 border border-white/5 rounded-3xl">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No se encontraron asistentes</h3>
              <p className="text-gray-400">Intenta ajustar los filtros de búsqueda.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
