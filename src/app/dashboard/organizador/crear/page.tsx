// src/app/dashboard/organizador/crear/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Image as ImageIcon, Plus, Trash2, ArrowLeft, Upload, DollarSign, Type } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';

export default function CrearEventoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [aforo, setAforo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [imagenPreview, setImagenPreview] = useState('');

  const [tiposEntrada, setTiposEntrada] = useState([
    { nombre: 'General', precio: '', cantidad: '' },
  ]);

  useEffect(() => {
    // Cargar categorías disponibles
    fetch('/api/categorias')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategorias(data.categorias);
        }
      })
      .catch(err => console.error('Error cargando categorías:', err));
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setImagenUrl(data.url);
      } else {
        alert('Error al subir imagen: ' + (data.error || 'Error desconocido'));
        setImagenPreview('');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir imagen');
      setImagenPreview('');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagenPreview('');
    setImagenUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          descripcion,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin || fechaInicio,
          ubicacion,
          aforo_max: parseInt(aforo),
          categoria_id: categoria,
          organizador_id: user.id,
          imagen_url: imagenUrl || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al crear evento');
      }

      for (const tipo of tiposEntrada) {
        if (tipo.nombre && tipo.precio) {
          await fetch('/api/tipos-entrada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              evento_id: result.evento.id,
              nombre: tipo.nombre,
              precio: parseFloat(tipo.precio),
              cantidad_total: tipo.cantidad ? parseInt(tipo.cantidad) : 100,
            }),
          });
        }
      }

      alert('Evento creado exitosamente');
      router.push('/dashboard/organizador/eventos');
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al crear evento');
    } finally {
      setLoading(false);
    }
  };

  const agregarTipoEntrada = () => {
    setTiposEntrada([...tiposEntrada, { nombre: '', precio: '', cantidad: '' }]);
  };

  const eliminarTipoEntrada = (index: number) => {
    const nuevos = [...tiposEntrada];
    nuevos.splice(index, 1);
    setTiposEntrada(nuevos);
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Crear Nuevo Evento</h1>
          <p className="text-gray-400 text-sm mt-1">Configura los detalles de tu próximo gran evento</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Sección de Imagen */}
        <div className="bg-[#1a1a1a]/60 border border-white/10 p-8 rounded-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <ImageIcon className="text-blue-500" size={24} />
            Imagen del Evento
          </h2>

          {imagenPreview ? (
            <div className="relative group rounded-2xl overflow-hidden border border-white/10">
              <img
                src={imagenPreview}
                alt="Preview del evento"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={uploadingImage}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105"
                >
                  <Trash2 size={18} />
                  Eliminar imagen
                </button>
              </div>
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-white font-medium">Subiendo imagen...</p>
                </div>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
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

        {/* Detalles Generales */}
        <div className="bg-[#1a1a1a]/60 border border-white/10 p-8 rounded-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Type className="text-purple-500" size={24} />
            Detalles Generales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Nombre del Evento *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                placeholder="Ej: Tech Summit 2024"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Categoría *</label>
              <CustomDropdown
                options={[
                  { value: '', label: 'Selecciona una categoría' },
                  ...categorias.map(cat => ({ value: cat.id, label: cat.nombre }))
                ]}
                value={categoria}
                onChange={(value) => setCategoria(value)}
                placeholder="Selecciona una categoría"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Descripción *</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600 resize-none"
              placeholder="Describe los detalles de tu evento..."
            />
          </div>
        </div>

        {/* Fecha y Ubicación */}
        <div className="bg-[#1a1a1a] border border-white/10 p-8 rounded-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Calendar className="text-orange-500" size={24} />
            Fecha y Ubicación
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Inicio *</label>
              <input
                type="datetime-local"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Fin (Opcional)</label>
              <input
                type="datetime-local"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <MapPin size={16} /> Ubicación *
              </label>
              <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                placeholder="Ej: Centro de Convenciones"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Users size={16} /> Aforo Máximo *
              </label>
              <input
                type="number"
                value={aforo}
                onChange={(e) => setAforo(e.target.value)}
                required
                min="1"
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                placeholder="Ej: 200"
              />
            </div>
          </div>
        </div>

        {/* Tipos de Entrada */}
        <div className="bg-[#1a1a1a] border border-white/10 p-8 rounded-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <DollarSign className="text-green-500" size={24} />
            Tipos de Entrada
          </h2>

          <div className="space-y-4">
            {tiposEntrada.map((tipo, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-start animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex-1 space-y-2">
                  <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Nombre</label>
                  <input
                    type="text"
                    value={tipo.nombre}
                    onChange={(e) => {
                      const nuevos = [...tiposEntrada];
                      nuevos[index].nombre = e.target.value;
                      setTiposEntrada(nuevos);
                    }}
                    placeholder="Ej: VIP"
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Precio</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={tipo.precio}
                      onChange={(e) => {
                        const nuevos = [...tiposEntrada];
                        nuevos[index].precio = e.target.value;
                        setTiposEntrada(nuevos);
                      }}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full pl-8 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${tipo.precio === '0' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={tipo.precio === '0'}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id={`gratis-${index}`}
                      checked={tipo.precio === '0'}
                      onChange={(e) => {
                        const nuevos = [...tiposEntrada];
                        nuevos[index].precio = e.target.checked ? '0' : '';
                        setTiposEntrada(nuevos);
                      }}
                      className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-black/20"
                    />
                    <label htmlFor={`gratis-${index}`} className="text-sm text-gray-400 cursor-pointer select-none">
                      Es gratis
                    </label>
                  </div>
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Cantidad</label>
                  <input
                    type="number"
                    value={tipo.cantidad}
                    onChange={(e) => {
                      const nuevos = [...tiposEntrada];
                      nuevos[index].cantidad = e.target.value;
                      setTiposEntrada(nuevos);
                    }}
                    placeholder="100"
                    min="1"
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="self-end md:pt-8">
                  <button
                    type="button"
                    onClick={() => eliminarTipoEntrada(index)}
                    disabled={tiposEntrada.length === 1}
                    className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={agregarTipoEntrada}
            className="mt-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-500/10"
          >
            <Plus size={18} />
            Agregar otro tipo de entrada
          </button>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading || uploadingImage}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/5 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creando...
              </>
            ) : uploadingImage ? (
              'Subiendo imagen...'
            ) : (
              'Crear Evento'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
