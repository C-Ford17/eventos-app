// src/app/dashboard/proveedor/servicios/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, EyeOff, Package, DollarSign, Briefcase, Search } from 'lucide-react';

export default function MisServiciosPage() {
  const router = useRouter();
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

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

      setServicios(servicios.filter(s => s.id !== servicioId));
      alert('Servicio eliminado exitosamente');
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

      setServicios(servicios.map(s =>
        s.id === servicioId ? { ...s, disponibilidad: !disponible } : s
      ));
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al actualizar disponibilidad');
    }
  };

  const serviciosFiltrados = servicios.filter(s =>
    s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 animate-pulse">Cargando tus servicios...</p>
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
            <Package className="text-blue-500" size={32} />
            Mis Servicios
          </h1>
          <p className="text-gray-400 mt-1">Gestiona tu catálogo de servicios y disponibilidad</p>
        </div>
        <Link
          href="/dashboard/proveedor/servicios/crear"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
        >
          <Plus size={20} />
          Crear Servicio
        </Link>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Buscar servicios..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full bg-[#1a1a1a]/60 border border-white/10 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
      </div>

      {serviciosFiltrados.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1a1a]/40 border border-white/5 rounded-3xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No tienes servicios {busqueda ? 'que coincidan' : 'creados'}</h3>
          <p className="text-gray-400 mb-8">Comienza a ofrecer tus servicios para recibir solicitudes.</p>
          {!busqueda && (
            <Link
              href="/dashboard/proveedor/servicios/crear"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Crear tu primer servicio
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {serviciosFiltrados.map((servicio) => (
            <div key={servicio.id} className="group bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {servicio.nombre}
                  </h3>
                  <span className="inline-block px-2 py-1 rounded-md bg-white/5 text-xs text-gray-400 border border-white/5">
                    {servicio.categoria}
                  </span>
                </div>
                <button
                  onClick={() => handleCambiarDisponibilidad(servicio.id, servicio.disponibilidad)}
                  className={`p-2 rounded-lg transition-colors ${servicio.disponibilidad
                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
                    }`}
                  title={servicio.disponibilidad ? 'Marcar como no disponible' : 'Marcar como disponible'}
                >
                  {servicio.disponibilidad ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>

              <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-1">
                {servicio.descripcion}
              </p>

              <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Precio Base</p>
                  <p className="text-white font-bold flex items-center gap-1">
                    <DollarSign size={14} className="text-green-500" />
                    {parseFloat(servicio.precio_base).toLocaleString('es-CO')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Contrataciones</p>
                  <p className="text-white font-bold flex items-center gap-1">
                    <Briefcase size={14} className="text-blue-500" />
                    {servicio.eventos?.length || 0}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-auto pt-4 border-t border-white/5">
                <button
                  onClick={() => router.push(`/dashboard/proveedor/servicios/${servicio.id}/editar`)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all border border-white/5"
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button
                  onClick={() => handleEliminarServicio(servicio.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-all border border-red-500/10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
