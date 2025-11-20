'use client';
import { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesButton({ userId }: { userId: string }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [favoritos, setFavoritos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showDropdown && userId) {
            loadFavorites();
        }
    }, [showDropdown, userId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const loadFavorites = async () => {
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

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-300 hover:text-white transition-colors"
                aria-label="Favoritos"
            >
                <Heart size={20} />
                {favoritos.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {favoritos.length}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-[#121212] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-white/5">
                        <h3 className="text-sm font-semibold text-white">Mis Favoritos</h3>
                    </div>

                    {loading ? (
                        <div className="px-4 py-8 text-center">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">Cargando...</p>
                        </div>
                    ) : favoritos.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <Heart className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">No tienes favoritos aún</p>
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto">
                            {favoritos.map((fav) => (
                                <Link
                                    key={fav.id}
                                    href={`/eventos/${fav.evento_id}`}
                                    className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                                    onClick={() => setShowDropdown(false)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium text-sm truncate">{fav.evento.nombre}</p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            {new Date(fav.evento.fecha_inicio).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                            })}
                                        </p>
                                        <p className="text-gray-500 text-xs">{fav.evento.categoria.nombre}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {favoritos.length > 0 && (
                        <div className="px-4 py-2 border-t border-white/5">
                            <Link
                                href="/dashboard/asistente/favoritos"
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                onClick={() => setShowDropdown(false)}
                            >
                                Ver todos →
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
