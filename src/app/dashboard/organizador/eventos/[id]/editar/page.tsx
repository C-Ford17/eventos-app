// src/app/dashboard/organizador/eventos/[id]/editar/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditarEventoPage() {
  const router = useRouter();
  const params = useParams();
  const eventoId = params.id;

  // Datos de ejemplo - en producción vendrían de la API
  const [formData, setFormData] = useState({
    nombre: 'Tech Summit 2024',
    descripcion: 'Conferencia sobre las últimas tecnologías',
    fecha: '2024-11-01T10:00',
    lugar: 'Centro de Convenciones',
    aforo: '200',
    precio: '75000',
    categoria: 'tecnologia',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Actualizar evento:', eventoId, formData);
    alert('Evento actualizado exitosamente (funcionalidad pendiente de API)');
    router.push('/dashboard/organizador/eventos');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Editar Evento</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-neutral-800 p-6 rounded-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Evento *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categoría *
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tecnologia">Tecnología</option>
              <option value="musica">Música</option>
              <option value="arte">Arte</option>
              <option value="deportes">Deportes</option>
              <option value="educacion">Educación</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descripción *
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha y Hora *
            </label>
            <input
              type="datetime-local"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lugar *
            </label>
            <input
              type="text"
              name="lugar"
              value={formData.lugar}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Aforo *
            </label>
            <input
              type="number"
              name="aforo"
              value={formData.aforo}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Precio (COP) *
            </label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold transition"
          >
            Guardar Cambios
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 bg-neutral-700 hover:bg-neutral-600 text-white py-3 rounded font-semibold transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
