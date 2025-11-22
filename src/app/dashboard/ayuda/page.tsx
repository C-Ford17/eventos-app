'use client';
import { HelpCircle, MessageCircle, Mail, Phone, FileText, Video } from 'lucide-react';
import ChatWidget from '@/components/ChatWidget';

export default function AyudaPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Centro de Ayuda</h1>
                <p className="text-gray-400">Encuentra respuestas a tus preguntas o contacta con soporte</p>
            </div>

            {/* Chat Widget */}
            <ChatWidget />

            {/* Opciones de ayuda */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Chat en vivo */}
                <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                        <MessageCircle className="text-blue-500" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Chat en Vivo</h3>
                    <p className="text-gray-400 mb-4">
                        Habla con nuestro asistente virtual 24/7. Haz clic en el botón flotante para iniciar una conversación.
                    </p>
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Disponible ahora
                    </div>
                </div>

                {/* Email */}
                <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-6">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                        <Mail className="text-purple-500" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Email</h3>
                    <p className="text-gray-400 mb-4">
                        Envíanos un correo y te responderemos en menos de 24 horas.
                    </p>
                    <a href="mailto:soporte@eventosapp.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                        soporte@eventosapp.com
                    </a>
                </div>

                {/* Teléfono */}
                <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-6">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                        <Phone className="text-green-500" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Teléfono</h3>
                    <p className="text-gray-400 mb-4">
                        Llámanos de lunes a viernes de 9:00 AM a 6:00 PM.
                    </p>
                    <a href="tel:+573001234567" className="text-blue-400 hover:text-blue-300 transition-colors">
                        +57 300 123 4567
                    </a>
                </div>
            </div>

            {/* Preguntas frecuentes */}
            <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <HelpCircle className="text-blue-500" size={28} />
                    Preguntas Frecuentes
                </h2>

                <div className="space-y-4">
                    <details className="group">
                        <summary className="cursor-pointer list-none flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                            <span className="text-white font-medium">¿Cómo creo un evento?</span>
                            <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="p-4 text-gray-400">
                            Para crear un evento, ve a tu dashboard de organizador y haz clic en "Crear Evento". Completa el formulario con la información del evento, agrega tipos de entrada y publica.
                        </div>
                    </details>

                    <details className="group">
                        <summary className="cursor-pointer list-none flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                            <span className="text-white font-medium">¿Cómo compro boletos?</span>
                            <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="p-4 text-gray-400">
                            Busca el evento que te interesa, selecciona la cantidad de boletos y tipo de entrada, y procede al pago. Recibirás tus boletos por email y podrás verlos en tu dashboard.
                        </div>
                    </details>

                    <details className="group">
                        <summary className="cursor-pointer list-none flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                            <span className="text-white font-medium">¿Cómo ofrezco servicios como proveedor?</span>
                            <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="p-4 text-gray-400">
                            Regístrate como proveedor, ve a tu dashboard y crea servicios con descripción, precio y categoría. Los organizadores podrán encontrarte y solicitar tus servicios.
                        </div>
                    </details>

                    <details className="group">
                        <summary className="cursor-pointer list-none flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                            <span className="text-white font-medium">¿Cómo funcionan los pagos?</span>
                            <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="p-4 text-gray-400">
                            Utilizamos Mercado Pago para procesar pagos de forma segura. Los organizadores reciben los pagos directamente en su cuenta de Mercado Pago.
                        </div>
                    </details>

                    <details className="group">
                        <summary className="cursor-pointer list-none flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                            <span className="text-white font-medium">¿Puedo cancelar mi reserva?</span>
                            <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="p-4 text-gray-400">
                            Sí, puedes solicitar la cancelación desde tu dashboard. Las políticas de reembolso dependen de cada evento y organizador.
                        </div>
                    </details>
                </div>
            </div>

            {/* Recursos adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="text-orange-500" size={24} />
                        <h3 className="text-xl font-bold text-white">Documentación</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                        Guías detalladas sobre cómo usar todas las funciones de la plataforma.
                    </p>
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        Ver documentación →
                    </button>
                </div>

                <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Video className="text-red-500" size={24} />
                        <h3 className="text-xl font-bold text-white">Video Tutoriales</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                        Aprende visualmente con nuestros tutoriales en video paso a paso.
                    </p>
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        Ver tutoriales →
                    </button>
                </div>
            </div>
        </div>
    );
}
