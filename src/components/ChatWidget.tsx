'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, User, Bot } from 'lucide-react';

interface Mensaje {
    id: string;
    contenido: string;
    es_bot: boolean;
    createdAt: string;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [inputMensaje, setInputMensaje] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversacionId, setConversacionId] = useState<string | null>(null);
    const [modoHumano, setModoHumano] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [mensajes]);

    useEffect(() => {
        if (isOpen && mensajes.length === 0) {
            // Mensaje de bienvenida
            setMensajes([{
                id: 'welcome',
                contenido: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
                es_bot: true,
                createdAt: new Date().toISOString()
            }]);
        }
    }, [isOpen]);

    const enviarMensaje = async () => {
        if (!inputMensaje.trim() || loading) return;

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) {
            alert('Debes iniciar sesión para usar el chat');
            return;
        }

        const nuevoMensaje = inputMensaje;
        setInputMensaje('');
        setLoading(true);

        // Agregar mensaje del usuario a la UI
        const mensajeTemp: Mensaje = {
            id: 'temp-' + Date.now(),
            contenido: nuevoMensaje,
            es_bot: false,
            createdAt: new Date().toISOString()
        };
        setMensajes(prev => [...prev, mensajeTemp]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: user.id,
                    conversacion_id: conversacionId,
                    mensaje: nuevoMensaje
                })
            });

            const data = await response.json();

            if (data.success) {
                setConversacionId(data.conversacion_id);

                // Actualizar mensaje del usuario con ID real
                setMensajes(prev => prev.map(m =>
                    m.id === mensajeTemp.id ? { ...data.mensaje, es_bot: false } : m
                ));

                // Agregar respuesta del bot si existe
                if (data.respuesta_bot) {
                    setMensajes(prev => [...prev, {
                        ...data.respuesta_bot,
                        es_bot: true
                    }]);
                }

                // Actualizar modo
                if (data.modo === 'humano' || data.requiere_humano) {
                    setModoHumano(true);
                }
            }
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            alert('Error al enviar mensaje');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje();
        }
    };

    return (
        <>
            {/* Botón flotante */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50 group"
                >
                    <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
                </button>
            )}

            {/* Ventana de chat */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Asistente Virtual</h3>
                                <p className="text-white/80 text-xs">
                                    {modoHumano ? 'Conectado con soporte' : 'En línea'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {mensajes.map((mensaje) => (
                            <div
                                key={mensaje.id}
                                className={`flex gap-2 ${mensaje.es_bot ? 'justify-start' : 'justify-end'}`}
                            >
                                {mensaje.es_bot && (
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Bot size={16} className="text-blue-400" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${mensaje.es_bot
                                            ? 'bg-white/5 text-gray-200'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{mensaje.contenido}</p>
                                </div>
                                {!mensaje.es_bot && (
                                    <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User size={16} className="text-indigo-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-2 justify-start">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                    <Bot size={16} className="text-blue-400" />
                                </div>
                                <div className="bg-white/5 px-4 py-2 rounded-2xl">
                                    <Loader2 size={16} className="animate-spin text-blue-400" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10">
                        {modoHumano && (
                            <div className="mb-2 text-xs text-yellow-400 flex items-center gap-1">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                                Un miembro del equipo te responderá pronto
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMensaje}
                                onChange={(e) => setInputMensaje(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Escribe tu mensaje..."
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                            />
                            <button
                                onClick={enviarMensaje}
                                disabled={loading || !inputMensaje.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
