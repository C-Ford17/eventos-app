// src/app/dashboard/organizador/proveedores/page.tsx
'use client';
import { useState } from 'react';

export default function ProveedoresPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');

  const proveedores = [
    {
      id: 1,
      nombre: 'Catering Gourmet SAS',
      categoria: 'Catering',
      calificacion: 4.8,
      serviciosRealizados: 45,
      descripcion: 'Servicio de catering para eventos corporativos y sociales',
      disponible: true,
    },
    {
      id: 2,
      nombre: 'Sonido Pro Audio',
      categoria: 'Audio',
      calificacion: 4.9,
      serviciosRealizados: 132,
      descripcion: 'Equipos de sonido profesional y técnicos especializados',
      disponible: true,
    },
    {
      id: 3,
      nombre: 'Luces y Efectos LED',
      categoria: 'Iluminación',
      calificacion: 4.7,
      serviciosRealizados: 89,
      descripcion: 'Iluminación escénica y efectos especiales',
      disponible: false,
    },
    {
      id: 4,
      nombre: 'Fotografía Eventos Pro',
      categoria: 'Fotografía',
      calificacion: 5.0,
      serviciosRealizados: 67,
      descripcion: 'Fotografía y video profesional para todo tipo de eventos',
      disponible: true,
    },
  ];

  const proveedoresFiltrados = proveedores.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaFiltro === 'todos' || p.categoria === categoriaFiltro;
    return matchBusqueda && matchCategoria;
  });

  const handleContactar = (proveedor: any) => {
    alert(`Contactando a ${proveedor.nombre}... (funcionalidad pendiente)`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Proveedores</h1>

      {/* Filtros */}
      <div className="bg-neutral-800 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Buscar proveedores..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="px-4 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="px-4 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todas las categorías</option>
            <option value="Catering">Catering</option>
            <option value="Audio">Audio</option>
            <option value="Iluminación">Iluminación</option>
            <option value="Fotografía">Fotografía</option>
            <option value="Decoración">Decoración</option>
            <option value="Seguridad">Seguridad</option>
          </select>
        </div>
      </div>

      {/* Lista de proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {proveedoresFiltrados.map((proveedor) => (
          <div key={proveedor.id} className="bg-neutral-800 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-semibold text-white">{proveedor.nombre}</h3>
                <span className="text-gray-400 text-sm">{proveedor.categoria}</span>
              </div>
              {proveedor.disponible ? (
                <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                  Disponible
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-600 text-white text-xs rounded-full">
                  No disponible
                </span>
              )}
            </div>

            <p className="text-gray-300 text-sm mb-4">{proveedor.descripcion}</p>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white font-semibold">{proveedor.calificacion}</span>
              </div>
              <span className="text-gray-400 text-sm">
                {proveedor.serviciosRealizados} servicios realizados
              </span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleContactar(proveedor)}
                disabled={!proveedor.disponible}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Contactar
              </button>
              <button className="px-4 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded transition">
                Ver Perfil
              </button>
            </div>
          </div>
        ))}
      </div>

      {proveedoresFiltrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No se encontraron proveedores con los filtros seleccionados</p>
        </div>
      )}
    </div>
  );
}
