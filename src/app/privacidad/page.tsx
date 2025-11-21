import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export default function PrivacidadPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    Volver al inicio
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <Lock className="text-purple-400" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold">Política de Privacidad</h1>
                </div>

                <div className="space-y-8 text-gray-300 leading-relaxed">
                    <section className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">1. Información que Recopilamos</h2>
                        <p>
                            Recopilamos información que nos proporcionas directamente, como tu nombre, correo electrónico y número de teléfono al registrarte. También recopilamos información sobre tus transacciones y uso de la plataforma.
                        </p>
                    </section>

                    <section className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">2. Uso de la Información</h2>
                        <p>
                            Utilizamos tu información para proporcionar, mantener y mejorar nuestros servicios, procesar transacciones, enviarte notificaciones relacionadas con eventos y detectar fraudes.
                        </p>
                    </section>

                    <section className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">3. Compartir Información</h2>
                        <p>
                            Compartimos información con los organizadores de los eventos a los que te inscribes. No vendemos tu información personal a terceros.
                        </p>
                    </section>

                    <section className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">4. Seguridad de Datos</h2>
                        <p>
                            Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos, incluyendo encriptación de credenciales sensibles.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
