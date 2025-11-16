// src/app/dashboard/proveedor/servicios/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MisServiciosPage() {
  const router = useRouter();
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.id) return;

    setLoading(true);
    
    fetch(`/api/servicios?proveedor_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setServicios(data.servicios);
        }
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleEliminarServicio = async (servicioId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) {
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`/api/servicios/${servicioId}?proveedor_id=${user.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al eliminar servicio');
      }

      alert('Servicio eliminado exitosamente');
      window.location.reload();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al eliminar servicio');
    }
  };

  const handleCambiarDisponibilidad = async (servicioId: string, disponible: boolean) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`/api/servicios/${servicioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disponibilidad: !disponible,
          proveedor_id: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al actualizar disponibilidad');
      }

      window.location.reload();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al actualizar disponibilidad');
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
        <h1 className="text-3xl font-bold text-white">Mis Servicios</h1>
        <Link
          href="/dashboard/proveedor/servicios/crear"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          + Crear Servicio
        </Link>
      </div>

      {servicios.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No tienes servicios creados aún</p>
          <Link
            href="/dashboard/proveedor/servicios/crear"
            className="text-blue-400 hover:text-blue-300"
          >
            Crear tu primer servicio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {servicios.map((servicio) => (
            <div key={servicio.id} className="bg-neutral-800 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{servicio.nombre}</h3>
                  <p className="text-gray-400 text-sm mt-1">{servicio.categoria}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs text-white ${
                    servicio.disponibilidad ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  {servicio.disponibilidad ? 'Disponible' : 'No disponible'}
                </span>
              </div>

              <p className="text-gray-300 mb-4">{servicio.descripcion}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Precio Base</p>
                  <p className="text-white font-semibold">
                    ${parseFloat(servicio.precio_base).toLocaleString('es-CO')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Contrataciones</p>
                  <p className="text-white font-semibold">
                    {servicio.eventos?.length || 0}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleCambiarDisponibilidad(servicio.id, servicio.disponibilidad)}
                  className={`flex-1 py-2 rounded transition text-sm ${
                    servicio.disponibilidad
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {servicio.disponibilidad ? 'Marcar No Disponible' : 'Marcar Disponible'}
                </button>
                <button
                  onClick={() => router.push(`/dashboard/proveedor/servicios/${servicio.id}/editar`)}
                  className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded transition text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminarServicio(servicio.id)}
                  className="px-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
