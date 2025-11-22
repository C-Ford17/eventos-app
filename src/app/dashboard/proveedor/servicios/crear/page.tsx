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
  Save,
  Upload,
  Trash2
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
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setImagenUrl(data.url);
      } else {
        throw new Error(data.error || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

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
          imagen_url: imagenUrl,
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

          {/* Imagen del Servicio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Upload size={16} className="text-blue-400" />
              Imagen del Servicio (Opcional)
            </label>
            {imagenUrl ? (
              <div className="relative w-full h-64 rounded-2xl overflow-hidden group border border-white/10">
                <img
                  src={imagenUrl}
                  alt="Preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setImagenUrl(null)}
                    className="p-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-all transform hover:scale-110"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-white font-medium">Subiendo imagen...</p>
                  </div>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="text-lg font-medium text-white mb-2 text-center">Sube una imagen</p>
                  <p className="text-gray-500 text-sm">Soporta JPG, PNG, WEBP (Máx. 5MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Nombre del Servicio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <FileText size={16} className="text-blue-400" />
              Nombre del Servicio
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
              placeholder="Ej: Servicio de Catering Premium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categoría */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Tag size={16} className="text-purple-400" />
                Categoría
              </label>
              <CustomDropdown
                options={[
                  { value: '', label: 'Selecciona una categoría' },
                  ...categorias.map(cat => ({ value: cat, label: cat }))
                ]}
                value={categoria}
                onChange={(value) => setCategoria(value)}
                placeholder="Selecciona una categoría"
              />
            </div>

            {/* Precio Base */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <DollarSign size={16} className="text-green-400" />
                Precio Base
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={precioBase}
                  onChange={(e) => setPrecioBase(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Briefcase size={16} className="text-orange-400" />
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600 resize-none"
              placeholder="Describe detalladamente lo que incluye tu servicio..."
            />
          </div>

          {/* Disponibilidad */}
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
            <div
              onClick={() => setDisponibilidad(!disponibilidad)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${disponibilidad ? 'bg-green-500' : 'bg-gray-600'
                }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${disponibilidad ? 'left-7' : 'left-1'
                  }`}
              />
            </div>
            <span className="text-sm font-medium text-gray-300">
              {disponibilidad ? 'Disponible para contratación' : 'No disponible temporalmente'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
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
