// src/app/dashboard/proveedor/historial/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { History, DollarSign, Calendar, Briefcase, CheckCircle, TrendingUp } from 'lucide-react';

export default function HistorialPage() {
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user.id) return;

    setLoading(true);

    // Cargar solicitudes completadas
    fetch(`/api/solicitudes?proveedor_id=${user.id}&estado=completado`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHistorial(data.solicitudes);
        }
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 animate-pulse">Cargando historial...</p>
        </div>
      </div>
    );
  }

  const totalServicios = historial.length;
  const ingresosTotales = historial.reduce(
    (sum, h) => sum + parseFloat(h.precio_acordado),
    0
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <History className="text-blue-500" size={32} />
          Historial de Servicios
        </h1>
        <p className="text-gray-400 mt-1">Registro de todos tus servicios completados</p>
      </div>

      {/* Resumen Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border border-blue-500/30 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-blue-500/20 rounded-xl text-blue-400">
            <Briefcase size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Total de Servicios</p>
            <p className="text-4xl font-bold text-white mt-1">{totalServicios}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/30 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-green-500/20 rounded-xl text-green-400">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Ingresos Totales</p>
            <p className="text-4xl font-bold text-white mt-1">
              ${(ingresosTotales / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>
      </div>

      {/* Lista de servicios completados */}
      {historial.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1a1a]/40 border border-white/5 rounded-3xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <History className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No hay historial disponible</h3>
          <p className="text-gray-400">Tus servicios completados aparecerán aquí.</p>
        </div>
      ) : (
        <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              Servicios Completados
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {historial.map((servicio) => (
              <div key={servicio.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {servicio.evento.nombre}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(servicio.evento.fecha_inicio).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={14} />
                        {servicio.productoServicio.nombre}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">
                      ${parseFloat(servicio.precio_acordado).toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Ingreso neto</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
