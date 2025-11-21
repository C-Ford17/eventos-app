import React from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, MessageCircle, Mail, FileQuestion } from 'lucide-react';

export default function AyudaPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    Volver al inicio
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-green-500/10 rounded-xl">
                        <HelpCircle className="text-green-400" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold">Centro de Ayuda</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-green-500/30 transition-all">
                        <MessageCircle className="text-green-400 mb-4" size={32} />
                        <h3 className="text-xl font-semibold mb-2">Chat de Soporte</h3>
                        <p className="text-gray-400 mb-4">Habla con nuestro equipo de soporte en tiempo real.</p>
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors">
                            Iniciar Chat
                        </button>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all">
                        <Mail className="text-blue-400 mb-4" size={32} />
                        <h3 className="text-xl font-semibold mb-2">Correo Electrónico</h3>
                        <p className="text-gray-400 mb-4">Envíanos tus dudas y te responderemos en 24h.</p>
                        <a href="mailto:soporte@eventplatform.com" className="text-blue-400 hover:text-blue-300">
                            soporte@eventplatform.com
                        </a>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Preguntas Frecuentes</h2>

                    <div className="space-y-4">
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <div className="flex items-start gap-3">
                                <FileQuestion className="text-gray-400 mt-1" size={20} />
                                <div>
                                    <h3 className="font-semibold text-white mb-2">¿Cómo puedo solicitar un reembolso?</h3>
                                    <p className="text-gray-400">Los reembolsos dependen de la política de cada organizador. Puedes solicitarlo desde la sección "Mis Reservas" en tu panel de control.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <div className="flex items-start gap-3">
                                <FileQuestion className="text-gray-400 mt-1" size={20} />
                                <div>
                                    <h3 className="font-semibold text-white mb-2">¿Dónde encuentro mis entradas?</h3>
                                    <p className="text-gray-400">Tus entradas se envían a tu correo electrónico y también están disponibles en la sección "Mis Reservas" del dashboard.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <div className="flex items-start gap-3">
                                <FileQuestion className="text-gray-400 mt-1" size={20} />
                                <div>
                                    <h3 className="font-semibold text-white mb-2">¿Es seguro pagar en la plataforma?</h3>
                                    <p className="text-gray-400">Sí, utilizamos Mercado Pago para procesar todas las transacciones de forma segura y encriptada.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
