'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Calendar, MapPin, Ticket, Loader2, Trash2 } from 'lucide-react';

export default function FavoritosPage() {
    const [favoritos, setFavoritos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            setUser(userData);
            loadFavorites(userData.id);
        } else {
            setLoading(false);
        }
    }, []);

    const loadFavorites = async (userId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/favoritos?usuario_id=${userId}`);
            const data = await res.json();
            if (data.success) {
                setFavoritos(data.favoritos);
            }
        } catch (error) {
            console.error('Error cargando favoritos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (eventoId: string, favoritoId: string) => {
        if (!user) return;

        setRemovingId(favoritoId);
        try {
            const res = await fetch(`/api/favoritos?usuario_id=${user.id}&evento_id=${eventoId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setFavoritos(favoritos.filter(fav => fav.id !== favoritoId));
            }
        } catch (error) {
            console.error('Error eliminando favorito:', error);
        } finally {
            setRemovingId(null);
        }
    };

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatearPrecio = (precio: number | null | undefined) => {
        if (!precio || precio === 0) {
            return 'Gratis';
        }
        return `$${precio.toLocaleString('es-CO')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-gray-400 animate-pulse">Cargando favoritos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-red-500/10 rounded-xl">
                        <Heart className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Mis Favoritos</h1>
                        <p className="text-gray-400 mt-1">
                            {favoritos.length} {favoritos.length === 1 ? 'evento guardado' : 'eventos guardados'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            {favoritos.length === 0 ? (
                <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-12 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-10 h-10 text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">No tienes favoritos aún</h2>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                        Explora eventos y guarda tus favoritos para acceder a ellos rápidamente
                    </p>
                    <Link
                        href="/explorar"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all hover:scale-105"
                    >
                        Explorar Eventos
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoritos.map((fav) => (
                        <div
                            key={fav.id}
                            className="group relative bg-[#1a1a1a]/60 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
                        >
                            {/* Remove Button - Outside Link */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveFavorite(fav.evento_id, fav.id);
                                }}
                                disabled={removingId === fav.id}
                                className="absolute top-3 right-3 z-20 p-2 bg-black/50 backdrop-blur-md border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 rounded-lg transition-all group/btn"
                                aria-label="Quitar de favoritos"
                            >
                                {removingId === fav.id ? (
                                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4 text-white group-hover/btn:text-red-400" />
                                )}
                            </button>

                            <Link href={`/eventos/${fav.evento_id}`} className="block">
                                {/* Image */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-800">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent opacity-60 z-10" />
                                    {fav.evento.imagen_url ? (
                                        <img
                                            src={fav.evento.imagen_url}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            alt={fav.evento.nombre}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Ticket className="w-12 h-12 text-neutral-600" />
                                        </div>
                                    )}

                                    {/* Category Badge */}
                                    <div className="absolute top-3 left-3 z-20 bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                        {fav.evento.categoria.nombre}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 mb-3">
                                        {fav.evento.nombre}
                                    </h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Calendar size={14} className="text-blue-500 shrink-0" />
                                            <span className="truncate">{formatearFecha(fav.evento.fecha_inicio)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <MapPin size={14} className="text-purple-500 shrink-0" />
                                            <span className="truncate">{fav.evento.ubicacion}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="text-sm text-gray-500">Desde</div>
                                        <div className="text-lg font-bold text-white">
                                            {formatearPrecio(fav.evento.precio_base)}
                                        </div>
                                    </div>

                                    {/* Organizer */}
                                    <div className="mt-3 pt-3 border-t border-white/5">
                                        <p className="text-xs text-gray-500">
                                            Por <span className="text-gray-400">{fav.evento.organizador.nombre}</span>
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Card */}
            {favoritos.length > 0 && (
                <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-white font-semibold mb-1">Tip</h3>
                            <p className="text-gray-300 text-sm">
                                Tus eventos favoritos se guardan automáticamente. Puedes acceder a ellos desde el icono de corazón en el navbar.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
