// src/app/dashboard/proveedor/historial/page.tsx
'use client';
import { useState } from 'react';

export default function HistorialPage() {
  const [filtro, setFiltro] = useState('todos');

  const historial = [
    {
      id: 1,
      evento: 'Conferencia Empresarial',
      organizador: 'Corp Solutions',
      fecha: '2024-10-25',
      servicio: 'Catering',
      monto: 4500000,
      calificacion: 5,
      comentario: 'Excelente servicio, muy profesionales',
    },
    {
      id: 2,
      evento: 'Fiesta de Cumpleaños',
      organizador: 'Pedro Martínez',
      fecha: '2024-10-20',
      servicio: 'Fotografía',
      monto: 800000,
      calificacion: 4,
      comentario: 'Buen trabajo, recomendados',
    },
    {
      id: 3,
      evento: 'Lanzamiento de Producto',
      organizador: 'StartUp Tech',
      fecha: '2024-10-15',
      servicio: 'Audio',
      monto: 1500000,
      calificacion: 5,
      comentario: 'Perfecta organización y equipos de calidad',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Historial de Servicios</h1>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="px-4 py-2 bg-neutral-800 text-white rounded border border-neutral-700"
        >
          <option value="todos">Todos</option>
          <option value="mes">Último mes</option>
          <option value="trimestre">Último trimestre</option>
          <option value="año">Último año</option>
        </select>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Total de Servicios</p>
          <p className="text-3xl font-bold text-white mt-2">{historial.length}</p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Ingresos Totales</p>
          <p className="text-3xl font-bold text-white mt-2">
            ${(historial.reduce((sum, h) => sum + h.monto, 0) / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Calificación Promedio</p>
          <div className="flex items-center mt-2">
            <p className="text-3xl font-bold text-white mr-2">
              {(historial.reduce((sum, h) => sum + h.calificacion, 0) / historial.length).toFixed(1)}
            </p>
            <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Lista de servicios completados */}
      <div className="space-y-4">
        {historial.map((servicio) => (
          <div key={servicio.id} className="bg-neutral-800 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{servicio.evento}</h3>
                <p className="text-gray-400 text-sm">
                  {servicio.organizador} • {new Date(servicio.fecha).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">
                  ${servicio.monto.toLocaleString('es-CO')}
                </p>
                <p className="text-gray-400 text-sm">{servicio.servicio}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < servicio.calificacion ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-400 text-sm">({servicio.calificacion}/5)</span>
            </div>

            <p className="text-gray-300 text-sm italic">"{servicio.comentario}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}
