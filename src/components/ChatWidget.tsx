'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, User, Bot, PlusCircle, Headphones } from 'lucide-react';

interface Mensaje {
    id: string;
    contenido: string;
    es_bot: boolean;
    createdAt: string;
    remitente_id?: string;
}

interface Conversacion {
    id: string;
    updatedAt: string;
    mensajes: Mensaje[];
    estado: string;
    requiere_humano: boolean;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [inputMensaje, setInputMensaje] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversacionId, setConversacionId] = useState<string | null>(null);
    const [modoHumano, setModoHumano] = useState(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Ref para controlar la actividad y el polling
    const lastActivityRef = useRef(Date.now());
    const isPollingRef = useRef(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) setUserId(user.id);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [mensajes]);

    // Actualizar actividad cuando el usuario escribe
    useEffect(() => {
        if (inputMensaje) {
            lastActivityRef.current = Date.now();
        }
    }, [inputMensaje]);

    // Cargar conversación inicial (Optimizada: 1 sola petición)
    useEffect(() => {
        const cargarConversacion = async () => {
            if (!isOpen) return;

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user.id) return;

            try {
                const res = await fetch(`/api/chat?usuario_id=${user.id}`);
                const data = await res.json();

                if (data.success) {
                    if (data.active_found && data.conversacion) {
                        // Conversación activa encontrada y cargada completamente
                        const conv = data.conversacion;
                        setConversacionId(conv.id);
                        setMensajes(conv.mensajes);
                        setLastUpdatedAt(conv.updatedAt);

                        if (conv.estado === 'humano' || conv.requiere_humano) {
                            setModoHumano(true);
                        }
                    } else {
                        // No hay activa, mostrar bienvenida
                        setMensajes([{
                            id: 'welcome',
                            contenido: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
                            es_bot: true,
                            createdAt: new Date().toISOString()
                        }]);
                    }
                }
            } catch (error) {
                console.error('Error cargando conversación:', error);
            }
        };

        cargarConversacion();
    }, [isOpen]);

    // Polling adaptativo y ligero
    useEffect(() => {
        if (!isOpen || !conversacionId) return;

        let timeoutId: NodeJS.Timeout;
        isPollingRef.current = true;

        const poll = async () => {
            if (!isPollingRef.current) return;

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user.id) return;

            try {
                // Enviar last_updated para evitar descarga innecesaria
                const url = `/api/chat?usuario_id=${user.id}&conversacion_id=${conversacionId}${lastUpdatedAt ? `&last_updated=${lastUpdatedAt}` : ''}`;
                const res = await fetch(url);
                const data = await res.json();

                if (data.success) {
                    if (data.modified === false) {
                        // No hay cambios, no hacemos nada (Ahorro de recursos)
                    } else if (data.conversacion) {
                        // Hay cambios reales
                        setMensajes(data.conversacion.mensajes);
                        setLastUpdatedAt(data.conversacion.updatedAt);
                        lastActivityRef.current = Date.now(); // Actualizar actividad

                        if (data.conversacion.estado === 'humano' || data.conversacion.requiere_humano) {
                            setModoHumano(true);
                        }
                    }
                }
            } catch (error) {
                console.error('Error en polling:', error);
            }

            // Calcular siguiente intervalo
            const timeSinceActivity = Date.now() - lastActivityRef.current;
            const nextDelay = timeSinceActivity < 60000 ? 3000 : 15000;

            timeoutId = setTimeout(poll, nextDelay);
        };

        poll();

        return () => {
            isPollingRef.current = false;
            clearTimeout(timeoutId);
        };
    }, [isOpen, conversacionId, lastUpdatedAt]);

    const nuevoChat = () => {
        setConversacionId(null);
        setLastUpdatedAt(null);
        setMensajes([{
            id: 'welcome',
            contenido: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
            es_bot: true,
            createdAt: new Date().toISOString()
        }]);
        setModoHumano(false);
    };

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
        lastActivityRef.current = Date.now();

        // Agregar mensaje temporal
        const mensajeTemp: Mensaje = {
            id: 'temp-' + Date.now(),
            contenido: nuevoMensaje,
            es_bot: false,
            createdAt: new Date().toISOString(),
            remitente_id: user.id
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

                if (data.respuesta_bot) {
                    setMensajes(prev => [...prev, {
                        ...data.respuesta_bot,
                        es_bot: true
                    }]);
                    lastActivityRef.current = Date.now();
                }

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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={nuevoChat}
                                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                                title="Nuevo Chat"
                            >
                                <PlusCircle size={20} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {mensajes.map((mensaje) => {
                            const esMio = mensaje.remitente_id === userId && !mensaje.es_bot;
                            const esBot = mensaje.es_bot;
                            const esAdmin = !esMio && !esBot;

                            return (
                                <div
                                    key={mensaje.id}
                                    className={`flex gap-2 ${esMio ? 'justify-end' : 'justify-start'}`}
                                >
                                    {(esBot || esAdmin) && (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${esAdmin ? 'bg-purple-500/20' : 'bg-blue-500/20'}`}>
                                            {esAdmin ? (
                                                <Headphones size={16} className="text-purple-400" />
                                            ) : (
                                                <Bot size={16} className="text-blue-400" />
                                            )}
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[75%] px-4 py-2 rounded-2xl ${esMio
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                            : 'bg-white/5 text-gray-200'
                                            }`}
                                    >
                                        {esAdmin && (
                                            <p className="text-xs text-purple-400 mb-1 font-medium">Soporte</p>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap">{mensaje.contenido}</p>
                                    </div>
                                    {esMio && (
                                        <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User size={16} className="text-indigo-400" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
