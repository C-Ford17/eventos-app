// src/app/dashboard/proveedor/historial/page.tsx
'use client';
import { useState, useEffect } from 'react';

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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalServicios = historial.length;
  const ingresosTotales = historial.reduce(
    (sum, h) => sum + parseFloat(h.precio_acordado), 
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Historial de Servicios</h1>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Total de Servicios</p>
          <p className="text-3xl font-bold text-white mt-2">{totalServicios}</p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Ingresos Totales</p>
          <p className="text-3xl font-bold text-white mt-2">
            ${(ingresosTotales / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      {/* Lista de servicios completados */}
      {historial.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No tienes servicios completados aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {historial.map((servicio) => (
            <div key={servicio.id} className="bg-neutral-800 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {servicio.evento.nombre}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {servicio.evento.organizador.nombre} • {new Date(servicio.evento.fecha_inicio).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">
                    ${parseFloat(servicio.precio_acordado).toLocaleString('es-CO')}
                  </p>
                  <p className="text-gray-400 text-sm">{servicio.productoServicio.nombre}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
