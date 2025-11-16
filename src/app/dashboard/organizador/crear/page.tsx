// src/app/dashboard/organizador/crear/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [imagenUrl, setImagenUrl] = useState(''); // ✅ NUEVO
  const [imagenPreview, setImagenPreview] = useState(''); // ✅ NUEVO

  const [tiposEntrada, setTiposEntrada] = useState([
    { nombre: 'General', precio: '' },
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

  // ✅ NUEVO: Manejar selección de imagen
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida (JPG, PNG, etc.)');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir a Cloudinary
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
        console.log('✅ Imagen subida:', data.url);
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

  // ✅ NUEVO: Remover imagen
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
          imagen_url: imagenUrl || null, // ✅ NUEVO: Incluir URL de imagen
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al crear evento');
      }

      // Crear tipos de entrada
      for (const tipo of tiposEntrada) {
        if (tipo.nombre && tipo.precio) {
          await fetch('/api/tipos-entrada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              evento_id: result.evento.id,
              nombre: tipo.nombre,
              precio: parseFloat(tipo.precio),
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
    setTiposEntrada([...tiposEntrada, { nombre: '', precio: '' }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Crear Nuevo Evento</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition"
        >
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-neutral-800 p-6 rounded-lg space-y-6">
        {/* ✅ NUEVO: Sección de imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Imagen del Evento (Opcional)
          </label>
          
          {imagenPreview ? (
            <div className="relative">
              <img 
                src={imagenPreview} 
                alt="Preview del evento" 
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={uploadingImage}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition disabled:opacity-50"
                title="Eliminar imagen"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-blue-500 transition bg-neutral-900/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
                    <p className="text-gray-400 text-sm">Subiendo imagen...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-400 text-sm mb-2">Click para subir imagen del evento</p>
                    <p className="text-gray-500 text-xs">PNG, JPG, WEBP (Máx. 5MB)</p>
                  </>
                )}
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
          <p className="text-gray-500 text-xs mt-2">
            💡 Recomendado: 1200x630px para mejor visualización
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Evento *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
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
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
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
            placeholder="Describe tu evento..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha y Hora de Inicio *
            </label>
            <input
              type="datetime-local"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha y Hora de Fin (opcional)
            </label>
            <input
              type="datetime-local"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ubicación *
            </label>
            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              required
              className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Centro de Convenciones"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Aforo Máximo *
            </label>
            <input
              type="number"
              value={aforo}
              onChange={(e) => setAforo(e.target.value)}
              required
              min="1"
              className="w-full px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tipos de Entrada
          </label>
          {tiposEntrada.map((tipo, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 mb-3">
              <input
                type="text"
                value={tipo.nombre}
                onChange={(e) => {
                  const nuevos = [...tiposEntrada];
                  nuevos[index].nombre = e.target.value;
                  setTiposEntrada(nuevos);
                }}
                placeholder="Ej: VIP"
                className="px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={tipo.precio}
                onChange={(e) => {
                  const nuevos = [...tiposEntrada];
                  nuevos[index].precio = e.target.value;
                  setTiposEntrada(nuevos);
                }}
                placeholder="Precio"
                min="0"
                step="0.01"
                className="px-3 py-2 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={agregarTipoEntrada}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            + Agregar tipo de entrada
          </button>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded font-semibold transition"
          >
            {loading ? 'Creando...' : uploadingImage ? 'Subiendo imagen...' : 'Crear Evento'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading || uploadingImage}
            className="px-6 bg-neutral-700 hover:bg-neutral-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded font-semibold transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
