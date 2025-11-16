// src/app/dashboard/organizador/crear/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CrearEventoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha: '',
    lugar: '',
    aforo: '',
    precio: '',
    categoria: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí irá la lógica para crear el evento en la API
    console.log('Crear evento:', formData);
    // Por ahora solo redirige
    alert('Evento creado exitosamente (funcionalidad pendiente de API)');
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
      <h1 className="text-3xl font-bold text-white">Crear Nuevo Evento</h1>

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
              placeholder="Ej: Tech Summit 2024"
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
              <option value="">Selecciona una categoría</option>
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
            placeholder="Describe tu evento..."
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
              placeholder="Ej: Centro de Convenciones"
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
              placeholder="Ej: 200"
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
              placeholder="Ej: 75000"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold transition"
          >
            Crear Evento
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
