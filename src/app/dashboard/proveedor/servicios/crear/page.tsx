// src/app/dashboard/proveedor/servicios/crear/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CrearServicioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precioBase, setPrecioBase] = useState('');
  const [disponibilidad, setDisponibilidad] = useState(true);

  const categorias = [
    'Catering',
    'Audio',
    'Iluminación',
    'Fotografía',
    'Video',
    'Decoración',
    'Seguridad',
    'Transporte',
    'Animación',
    'Tecnología',
    'Mobiliario',
    'Otro',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch('/api/servicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proveedor_id: user.id,
          nombre,
          descripcion,
          categoria,
          precio_base: parseFloat(precioBase),
          disponibilidad,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al crear servicio');
      }

      alert('Servicio creado exitosamente');
      router.push('/dashboard/proveedor/servicios');
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al crear servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          ← Volver
        </button>
        <h1 className="text-3xl font-bold text-white">Crear Nuevo Servicio</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-neutral-800 p-6 rounded-lg space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre del Servicio *
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Servicio de Catering Premium"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Categoría *
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
            className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descripción *
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe tu servicio en detalle..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Precio Base (COP) *
          </label>
          <input
            type="number"
            value={precioBase}
            onChange={(e) => setPrecioBase(e.target.value)}
            required
            min="0"
            step="1000"
            className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 500000"
          />
          <p className="text-gray-400 text-xs mt-1">
            Este es el precio base que se mostrará a los organizadores
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="disponibilidad"
            checked={disponibilidad}
            onChange={(e) => setDisponibilidad(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-neutral-900 border-neutral-700 rounded focus:ring-blue-500"
          />
          <label htmlFor="disponibilidad" className="ml-2 text-sm text-gray-300">
            Marcar como disponible para contratación
          </label>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Servicio'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-6 bg-neutral-700 hover:bg-neutral-600 text-white py-3 rounded font-semibold transition disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
