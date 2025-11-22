'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, User, Clock, AlertCircle, CheckCircle, Send } from 'lucide-react';

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
}

export default function AdminChatPage() {
    const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
    const [conversacionActiva, setConversacionActiva] = useState<Conversacion | null>(null);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        cargarConversaciones();
    }, []);

    const cargarConversaciones = async () => {
        try {
            const response = await fetch('/api/admin/chat');
            const data = await response.json();
            if (data.success) {
                setConversaciones(data.conversaciones);
            }
        } catch (error) {
            console.error('Error cargando conversaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const tomarConversacion = async (conversacionId: string) => {
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
                cargarConversaciones();
                setConversacionActiva(data.conversacion);
            }
        } catch (error) {
            console.error('Error tomando conversación:', error);
        }
    };

    const enviarMensaje = async () => {
        if (!mensaje.trim() || !conversacionActiva) return;

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: user.id,
                    conversacion_id: conversacionActiva.id,
                    mensaje
                })
            });

            if (response.ok) {
                setMensaje('');
                // Recargar conversación activa
                const conv = conversaciones.find(c => c.id === conversacionActiva.id);
                if (conv) setConversacionActiva(conv);
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
                    <div className="text-center text-gray-400 py-8">No hay conversaciones</div>
                ) : (
                    <div className="space-y-2">
                        {conversaciones.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => setConversacionActiva(conv)}
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
                            </div>
                        </div>

                        {/* Mensajes */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {conversacionActiva.mensajes.map((msg: any) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.es_bot ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div
                                        className={`max-w-[75%] px-4 py-2 rounded-2xl ${msg.es_bot
                                                ? 'bg-white/5 text-gray-200'
                                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.contenido}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={mensaje}
                                    onChange={(e) => setMensaje(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                                    placeholder="Escribe tu respuesta..."
                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    onClick={enviarMensaje}
                                    disabled={!mensaje.trim()}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all disabled:opacity-50"
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
