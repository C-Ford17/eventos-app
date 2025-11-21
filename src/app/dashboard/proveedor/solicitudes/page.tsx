// src/app/dashboard/proveedor/solicitudes/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { MessageSquare, Calendar, MapPin, DollarSign, CheckCircle, XCircle, Clock, Filter, User, Flag } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';
import ReportModal from '@/components/ReportModal';

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('pendiente');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<{ id: string, nombre: string } | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user.id) return;

    setLoading(true);

    const params = new URLSearchParams();
    params.append('proveedor_id', user.id);
    if (filtroEstado !== 'todas') {
      params.append('estado', filtroEstado);
    }

    fetch(`/api/solicitudes?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSolicitudes(data.solicitudes);
        }
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, [filtroEstado]);

  const handleActualizarEstado = async (solicitudId: string, nuevoEstado: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`/api/solicitudes/${solicitudId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado_contratacion: nuevoEstado,
          proveedor_id: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al actualizar solicitud');
      }

      setSolicitudes(solicitudes.map(s =>
        s.id === solicitudId ? { ...s, estado_contratacion: nuevoEstado } : s
      ));

      // Si estamos filtrando por estado y el estado cambió, la solicitud desaparecerá de la lista visualmente
      // pero es mejor mantenerla visible hasta que se refresque o cambie el filtro para feedback inmediato
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al actualizar solicitud');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><Clock size={12} /> Pendiente</span>;
      case 'aceptado':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle size={12} /> Aceptado</span>;
      case 'rechazado':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><XCircle size={12} /> Rechazado</span>;
      case 'completado':
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"><CheckCircle size={12} /> Completado</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 animate-pulse">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="text-blue-500" size={32} />
            Solicitudes de Servicio
          </h1>
          <p className="text-gray-400 mt-1">Gestiona las peticiones de los organizadores</p>
        </div>

        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <CustomDropdown
            options={[
              { value: 'todas', label: 'Todas' },
              { value: 'pendiente', label: 'Pendientes' },
              { value: 'aceptado', label: 'Aceptadas' },
              { value: 'rechazado', label: 'Rechazadas' },
              { value: 'completado', label: 'Completadas' }
            ]}
            value={filtroEstado}
            onChange={(value) => setFiltroEstado(value)}
            placeholder="Filtrar por estado"
            buttonClassName="pl-12 min-w-[200px]"
            className="min-w-[200px]"
          />
        </div>

      </div>

      {solicitudes.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1a1a]/40 border border-white/5 rounded-3xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No hay solicitudes {filtroEstado !== 'todas' ? filtroEstado + 's' : ''}</h3>
          <p className="text-gray-400">Cuando recibas nuevas solicitudes aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {solicitudes.map((solicitud) => (
            <div key={solicitud.id} className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 border-b border-white/5 pb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {solicitud.evento.nombre}
                    </h3>
                    {getStatusBadge(solicitud.estado_contratacion)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <User size={14} />
                    <span>Organizador: <span className="text-white font-medium">{solicitud.evento.organizador.nombre}</span></span>
                    <button
                      onClick={() => {
                        setReportData({ id: solicitud.evento.organizador.id, nombre: solicitud.evento.organizador.nombre });
                        setShowReportModal(true);
                      }}
                      className="text-gray-500 hover:text-red-500 transition-colors ml-2"
                      title="Reportar organizador"
                    >
                      <Flag size={14} />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Precio Acordado</p>
                  <p className="text-2xl font-bold text-green-400 flex items-center justify-end gap-1">
                    <DollarSign size={20} />
                    {parseFloat(solicitud.precio_acordado).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                    <Calendar size={12} /> Fecha del Evento
                  </p>
                  <p className="text-white font-medium">
                    {new Date(solicitud.evento.fecha_inicio).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                    <MapPin size={12} /> Ubicación
                  </p>
                  <p className="text-white font-medium truncate">
                    {solicitud.evento.ubicacion}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-gray-500 text-xs mb-2">Servicio Solicitado</p>
                  <p className="text-white font-medium">{solicitud.productoServicio.nombre}</p>
                  <p className="text-gray-400 text-xs mt-1">Cantidad: {solicitud.cantidad}</p>
                </div>
              </div>

              {solicitud.mensaje && (
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-6">
                  <p className="text-blue-400 text-xs font-bold mb-1">Mensaje del Organizador:</p>
                  <p className="text-gray-300 text-sm italic">"{solicitud.mensaje}"</p>
                </div>
              )}

              {solicitud.estado_contratacion === 'pendiente' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleActualizarEstado(solicitud.id, 'aceptado')}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/40"
                  >
                    Aceptar Solicitud
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de rechazar esta solicitud?')) {
                        handleActualizarEstado(solicitud.id, 'rechazado');
                      }
                    }}
                    className="flex-1 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 py-3 rounded-xl font-medium transition-all border border-white/5 hover:border-red-500/30"
                  >
                    Rechazar
                  </button>
                </div>
              )}

              {solicitud.estado_contratacion === 'aceptado' && (
                <button
                  onClick={() => handleActualizarEstado(solicitud.id, 'completado')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Marcar como Completado
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        tipo="usuario"
        entidadId={reportData?.id}
        entidadNombre={reportData?.nombre}
        reportanteId={JSON.parse(localStorage.getItem('user') || '{}').id}
      />
    </div>
  );
}
