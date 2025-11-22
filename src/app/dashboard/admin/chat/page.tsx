'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, User, Clock, AlertCircle, CheckCircle, Send, Bot, Headphones } from 'lucide-react';

interface Conversacion {
    id: string;
    usuario: {
        nombre: string;
        email: string;
        tipo_usuario: string;
    };
    estado: string;
    requiere_humano: boolean;
    mensajes: any[];
    createdAt: string;
    updatedAt: string;
    admin?: {
        nombre: string;
    };
}

export default function AdminChatPage() {
    const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
    const [conversacionActiva, setConversacionActiva] = useState<Conversacion | null>(null);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [adminId, setAdminId] = useState<string | null>(null);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

    // Refs para polling adaptativo
    const lastActivityRef = useRef(Date.now());
    const isPollingRef = useRef(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) setAdminId(user.id);
        cargarConversaciones();
    }, []);

    // Actualizar actividad al escribir
    useEffect(() => {
        if (mensaje) {
            lastActivityRef.current = Date.now();
        }
    }, [mensaje]);

    // Polling adaptativo y optimizado
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        isPollingRef.current = true;

        const poll = async () => {
            if (!isPollingRef.current) return;
            // Si estamos cargando, esperar
            if (loading) {
                timeoutId = setTimeout(poll, 1000);
                return;
            }

            try {
                // Enviar last_updated para evitar descarga innecesaria
                const url = `/api/admin/chat${lastUpdatedAt ? `?last_updated=${lastUpdatedAt}` : ''}`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.success) {
                    if (data.modified === false) {
                        // No hay cambios, no hacemos nada
                    } else {
                        // Hay cambios, actualizar todo
                        setConversaciones(data.conversaciones);

                        // Actualizar lastUpdatedAt con la fecha más reciente de las conversaciones
                        if (data.conversaciones.length > 0) {
                            const mostRecent = data.conversaciones[0].updatedAt;
                            setLastUpdatedAt(mostRecent);
                            lastActivityRef.current = Date.now(); // Hubo cambios, mantener actividad alta
                        } else {
                            setLastUpdatedAt(null);
                        }
                    }
                }
            } catch (error) {
                console.error('Error cargando conversaciones:', error);
            } finally {
                setLoading(false);
            }

            // Calcular delay
            const timeSinceActivity = Date.now() - lastActivityRef.current;
            // Si no hay conversación activa, relajar el polling a 10s
            const baseDelay = conversacionActiva ? 3000 : 10000;
            const nextDelay = timeSinceActivity < 60000 ? baseDelay : 30000;

            timeoutId = setTimeout(poll, nextDelay);
        };

        poll();

        return () => {
            isPollingRef.current = false;
            clearTimeout(timeoutId);
        };
    }, [lastUpdatedAt]); // Dependencia crítica para actualizar la URL

    // Actualizar conversación activa cuando llegan nuevos mensajes
    useEffect(() => {
        if (conversacionActiva) {
            const actualizada = conversaciones.find(c => c.id === conversacionActiva.id);
            // Si la conversación activa se actualizó (tiene más mensajes o cambió estado)
            if (actualizada && JSON.stringify(actualizada.mensajes) !== JSON.stringify(conversacionActiva.mensajes)) {
                setConversacionActiva(actualizada);
            }
        }
    }, [conversaciones]);

    const cargarConversaciones = async () => {
        try {
            const response = await fetch('/api/admin/chat');
            const data = await response.json();
            if (data.success) {
                setConversaciones(data.conversaciones);
                if (data.conversaciones.length > 0) {
                    setLastUpdatedAt(data.conversaciones[0].updatedAt);
                }
            }
        } catch (error) {
            console.error('Error cargando conversaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const tomarConversacion = async (conversacionId: string) => {
        lastActivityRef.current = Date.now();
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await fetch('/api/admin/chat', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversacion_id: conversacionId,
                    admin_id: user.id,
                    accion: 'tomar'
                })
            });

            const data = await response.json();
            if (data.success) {
                // Forzar recarga completa para actualizar estados
                cargarConversaciones();
                setConversacionActiva(data.conversacion);
            }
        } catch (error) {
            console.error('Error tomando conversación:', error);
        }
    };

    const enviarMensaje = async () => {
        if (!mensaje.trim() || !conversacionActiva) return;

        lastActivityRef.current = Date.now();

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: adminId,
                    conversacion_id: conversacionActiva.id,
                    mensaje
                })
            });

            // Nota: El endpoint /api/chat espera 'usuario_id' y lo usa como remitente.
            // Si el admin es un usuario válido, funcionará.

            if (response.ok) {
                setMensaje('');
                // Forzar actualización inmediata
                cargarConversaciones();
            }
        } catch (error) {
            console.error('Error enviando mensaje:', error);
        }
    };

    return (
        <div className="h-[calc(100vh-120px)] flex gap-6">
            {/* Lista de conversaciones */}
            <div className="w-1/3 bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-4 overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MessageCircle className="text-blue-500" size={24} />
                    Conversaciones
                </h2>

                {loading ? (
                    <div className="text-center text-gray-400 py-8">Cargando...</div>
                ) : conversaciones.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">No hay conversaciones activas</div>
                ) : (
                    <div className="space-y-2">
                        {conversaciones.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => {
                                    setConversacionActiva(conv);
                                    lastActivityRef.current = Date.now();
                                }}
                                className={`p-4 rounded-xl cursor-pointer transition-all ${conversacionActiva?.id === conv.id
                                    ? 'bg-blue-500/20 border border-blue-500/30'
                                    : 'bg-white/5 hover:bg-white/10 border border-white/5'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-gray-400" />
                                        <span className="text-white font-medium">{conv.usuario.nombre}</span>
                                    </div>
                                    {conv.requiere_humano && (
                                        <AlertCircle size={16} className="text-yellow-400" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mb-1">{conv.usuario.email}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock size={12} />
                                    {new Date(conv.updatedAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Conversación activa */}
            <div className="flex-1 bg-[#1a1a1a]/60 border border-white/10 rounded-2xl flex flex-col">
                {conversacionActiva ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{conversacionActiva.usuario.nombre}</h3>
                                    <p className="text-sm text-gray-400">{conversacionActiva.usuario.tipo_usuario}</p>
                                </div>
                                {conversacionActiva.estado === 'bot' && (
                                    <button
                                        onClick={() => tomarConversacion(conversacionActiva.id)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-all"
                                    >
                                        Tomar conversación
                                    </button>
                                )}
                                {conversacionActiva.admin && (
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                        <Headphones size={12} />
                                        Atendido por: {conversacionActiva.admin.nombre}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mensajes */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {conversacionActiva.mensajes.map((msg: any) => {
                                // En admin: es mío si lo envié yo (adminId). 
                                const esMio = msg.remitente_id === adminId;
                                const esBot = msg.es_bot;

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-2 ${esMio ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {!esMio && (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${esBot ? 'bg-blue-500/20' : 'bg-indigo-500/20'}`}>
                                                {esBot ? (
                                                    <Bot size={16} className="text-blue-400" />
                                                ) : (
                                                    <User size={16} className="text-indigo-400" />
                                                )}
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[75%] px-4 py-2 rounded-2xl ${esMio
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                                : 'bg-white/5 text-gray-200'
                                                }`}
                                        >
                                            {esBot && (
                                                <p className="text-xs text-blue-400 mb-1 font-medium">Bot</p>
                                            )}
                                            <p className="text-sm whitespace-pre-wrap">{msg.contenido}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={mensaje}
                                    onChange={(e) => setMensaje(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !loading && conversacionActiva.estado === 'humano' && enviarMensaje()}
                                    placeholder={conversacionActiva.estado === 'humano' ? "Escribe tu respuesta..." : "Debes tomar la conversación para responder"}
                                    disabled={conversacionActiva.estado !== 'humano'}
                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    onClick={enviarMensaje}
                                    disabled={!mensaje.trim() || conversacionActiva.estado !== 'humano'}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Selecciona una conversación para ver los mensajes
                    </div>
                )}
            </div>
        </div>
    );
}
