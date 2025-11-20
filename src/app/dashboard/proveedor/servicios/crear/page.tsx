// src/app/dashboard/proveedor/servicios/crear/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  DollarSign,
  FileText,
  Tag,
  Check,
  X,
  Loader2,
  ArrowLeft,
  Save
} from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';

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

      // alert('Servicio creado exitosamente'); // Removed alert for better UX
      router.push('/dashboard/proveedor/servicios');
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al crear servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Crear Nuevo Servicio</h1>
          <p className="text-gray-400">Añade un nuevo servicio a tu catálogo</p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-[#1a1a1a]/40 border border-white/5 rounded-3xl p-4 md:p-8 shadow-xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Nombre del Servicio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">
              Nombre del Servicio <span className="text-blue-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Ej: Servicio de Catering Premium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categoría */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">
                Categoría <span className="text-blue-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={18} />
                <CustomDropdown
                  options={categorias.map(cat => ({ value: cat, label: cat }))}
                  value={categoria}
                  onChange={(value) => setCategoria(value)}
                  placeholder="Selecciona una categoría"
                  buttonClassName="pl-12 w-full"
                  className="w-full"
                />
              </div>
            </div>

            {/* Precio Base */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">
                Precio Base (COP) <span className="text-blue-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="number"
                  value={precioBase}
                  onChange={(e) => setPrecioBase(e.target.value)}
                  required
                  min="0"
                  step="1000"
                  className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Ej: 500000"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">
              Descripción <span className="text-blue-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-gray-500" size={18} />
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                rows={4}
                className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                placeholder="Describe tu servicio en detalle..."
              />
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="flex items-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="disponibilidad"
                  type="checkbox"
                  checked={disponibilidad}
                  onChange={(e) => setDisponibilidad(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-black/20 border-white/10 rounded focus:ring-blue-500 focus:ring-offset-0"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="disponibilidad" className="font-medium text-blue-400">
                  Disponible para contratación inmediata
                </label>
                <p className="text-gray-400 text-xs mt-0.5">
                  Si marcas esta opción, los organizadores podrán ver y solicitar este servicio.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <X size={18} />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creando Servicio...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Crear Servicio
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
