'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Package, DollarSign, AlignLeft, ArrowLeft, Save, Trash2, Upload } from 'lucide-react';

export default function EditarServicioPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precioBase, setPrecioBase] = useState('');
    const [categoria, setCategoria] = useState('');
    const [disponible, setDisponible] = useState(true);
    const [imagenUrl, setImagenUrl] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const categorias = [
        'Catering',
        'Fotografía',
        'Video',
        'Sonido',
        'Decoración',
        'Transporte',
        'Seguridad',
        'Tecnología',
        'Entretenimiento',
        'Otros'
    ];

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) return;

        // Cargar datos del servicio
        fetch(`/api/servicios/${params.id}?proveedor_id=${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const s = data.servicio;
                    setNombre(s.nombre);
                    setDescripcion(s.descripcion);
                    setPrecioBase(s.precio_base.toString());
                    setCategoria(s.categoria);
                    setDisponible(s.disponibilidad);
                    setImagenUrl(s.imagen_url);
                } else {
                    alert('Error al cargar servicio');
                    router.push('/dashboard/proveedor/servicios');
                }
            })
            .catch(err => console.error('Error:', err))
            .finally(() => setLoading(false));
    }, [params.id, router]);

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
        setSaving(true);

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            const response = await fetch(`/api/servicios/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    descripcion,
                    precio_base: parseFloat(precioBase),
                    categoria,
                    disponibilidad: disponible,
                    proveedor_id: user.id,
                    imagen_url: imagenUrl,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Error al actualizar servicio');
            }

            alert('Servicio actualizado exitosamente');
            router.push('/dashboard/proveedor/servicios');
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.message || 'Error al actualizar servicio');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 animate-pulse">Cargando servicio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">Editar Servicio</h1>
                    <p className="text-gray-400 text-sm mt-1">Actualiza la información de tu servicio</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Imagen del Servicio */}
                <div className="bg-[#1a1a1a]/60 border border-white/10 p-8 rounded-2xl">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-4">
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

                <div className="bg-[#1a1a1a]/60 border border-white/10 p-8 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Package size={16} className="text-blue-500" />
                                Nombre del Servicio *
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Categoría *</label>
                            <select
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-neutral-900">Selecciona una categoría</option>
                                {categorias.map((cat) => (
                                    <option key={cat} value={cat} className="bg-neutral-900">
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 mb-6">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <AlignLeft size={16} className="text-purple-500" />
                            Descripción *
                        </label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            required
                            rows={4}
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600 resize-none"
                            placeholder="Describe detalladamente qué incluye tu servicio..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <DollarSign size={16} className="text-green-500" />
                                Precio Base *
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Disponibilidad</label>
                            <div className="flex items-center gap-4 h-[50px]">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={disponible}
                                        onChange={() => setDisponible(true)}
                                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                                    />
                                    <span className="text-white">Disponible</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={!disponible}
                                        onChange={() => setDisponible(false)}
                                        className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500"
                                    />
                                    <span className="text-white">No disponible</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={saving}
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/5 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
