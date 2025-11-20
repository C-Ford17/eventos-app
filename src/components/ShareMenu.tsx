'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Check, X } from 'lucide-react';

interface ShareMenuProps {
    isOpen: boolean;
    onClose: () => void;
    shareButtonRef: React.RefObject<HTMLButtonElement | null>;
    evento: any;
}

export default function ShareMenu({ isOpen, onClose, shareButtonRef, evento }: ShareMenuProps) {
    const [copied, setCopied] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const copyToClipboard = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                onClose();
            }, 2000);
        });
    };

    const shareToWhatsApp = () => {
        const url = window.location.href;
        const text = `¡Mira este evento! ${evento?.nombre}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        onClose();
    };

    const shareToFacebook = () => {
        const url = window.location.href;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        onClose();
    };

    const shareToTwitter = () => {
        const url = window.location.href;
        const text = `¡Mira este evento! ${evento?.nombre}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        onClose();
    };

    if (!isMounted) return null;

    return createPortal(
        <>
            {/* Backdrop oscuro para cerrar al hacer click fuera */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Menú container - RESPONSIVE */}
            <div
                className={`
          fixed z-50
          transition-all duration-200 ease-out
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
          
          /* Mobile: Bottom Sheet (desde abajo) */
          left-0 right-0 bottom-0 mx-auto
          w-full max-w-md
          sm:max-w-none
          
          /* Desktop: Dropdown cerca del botón */
          sm:absolute sm:left-auto sm:right-auto sm:bottom-auto
          sm:top-full sm:mt-2
          sm:w-[240px] sm:max-w-none
        `}
                style={{
                    // Posición para desktop (calculada respecto al botón)
                    ...(shareButtonRef.current && window.innerWidth >= 640
                        ? {
                            top: `${shareButtonRef.current.getBoundingClientRect().bottom + 8}px`,
                            left: `${shareButtonRef.current.getBoundingClientRect().right - 240}px`,
                            width: '240px',
                        }
                        : {}),
                }}
            >
                {/* Contenido del menú */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-t-2xl sm:rounded-xl shadow-2xl p-3">
                    <div className="flex items-center justify-between mb-2 sm:hidden">
                        <h3 className="text-white font-semibold">Compartir</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <button
                        onClick={copyToClipboard}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
                        {copied ? 'Copiado!' : 'Copiar enlace'}
                    </button>
                    <button
                        onClick={shareToWhatsApp}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        WhatsApp
                    </button>
                    <button
                        onClick={shareToFacebook}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                    </button>
                    <button
                        onClick={shareToTwitter}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        Twitter
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
}
