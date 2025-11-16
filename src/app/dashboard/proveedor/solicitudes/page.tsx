// src/app/dashboard/proveedor/solicitudes/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('pendiente');

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

      alert(`Solicitud ${nuevoEstado} exitosamente`);
      window.location.reload();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al actualizar solicitud');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Solicitudes de Servicio</h1>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2 bg-neutral-800 text-white rounded border border-neutral-700"
        >
          <option value="todas">Todas</option>
          <option value="pendiente">Pendientes</option>
          <option value="aceptado">Aceptadas</option>
          <option value="rechazado">Rechazadas</option>
          <option value="completado">Completadas</option>
        </select>
      </div>

      {solicitudes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No hay solicitudes {filtroEstado !== 'todas' ? filtroEstado + 's' : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {solicitudes.map((solicitud) => (
            <div key={solicitud.id} className="bg-neutral-800 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {solicitud.evento.nombre}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Por: {solicitud.evento.organizador.nombre}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs text-white ${
                    solicitud.estado_contratacion === 'pendiente'
                      ? 'bg-yellow-600'
                      : solicitud.estado_contratacion === 'aceptado'
                      ? 'bg-green-600'
                      : solicitud.estado_contratacion === 'rechazado'
                      ? 'bg-red-600'
                      : 'bg-blue-600'
                  }`}
                >
                  {solicitud.estado_contratacion}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Fecha Evento</p>
                  <p className="text-white">
                    {new Date(solicitud.evento.fecha_inicio).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Lugar</p>
                  <p className="text-white">{solicitud.evento.ubicacion}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Servicio</p>
                  <p className="text-white">{solicitud.productoServicio.nombre}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Precio Acordado</p>
                  <p className="text-white">
                    ${parseFloat(solicitud.precio_acordado).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Servicio Solicitado</p>
                <p className="text-gray-300">{solicitud.productoServicio.categoria}</p>
                <p className="text-gray-400 text-xs mt-1">
                  Cantidad: {solicitud.cantidad}
                </p>
              </div>

              {solicitud.estado_contratacion === 'pendiente' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleActualizarEstado(solicitud.id, 'aceptado')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
                  >
                    Aceptar Solicitud
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de rechazar esta solicitud?')) {
                        handleActualizarEstado(solicitud.id, 'rechazado');
                      }
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition"
                  >
                    Rechazar
                  </button>
                </div>
              )}

              {solicitud.estado_contratacion === 'aceptado' && (
                <button
                  onClick={() => handleActualizarEstado(solicitud.id, 'completado')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
                >
                  Marcar como Completado
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
