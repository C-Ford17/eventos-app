import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

export default function TerminosPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    Volver al inicio
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <FileText className="text-blue-400" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold">Términos y Condiciones</h1>
                </div>

                <div className="space-y-8 text-gray-300 leading-relaxed">
                    <section className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">1. Aceptación de los Términos</h2>
                        <p>
                            Al acceder y utilizar EventPlatform, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.
                        </p>
                    </section>

                    <section className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">2. Descripción del Servicio</h2>
                        <p>
                            EventPlatform es una plataforma que permite a los organizadores crear, gestionar y vender entradas para eventos, y a los usuarios descubrir y asistir a dichos eventos.
                        </p>
                    </section>

                    <section className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">3. Cuentas de Usuario</h2>
                        <p>
                            Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Aceptas la responsabilidad de todas las actividades que ocurran bajo tu cuenta.
                        </p>
                    </section>

                    <section className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4">4. Pagos y Reembolsos</h2>
                        <p>
                            Los pagos se procesan a través de Mercado Pago. Las políticas de reembolso son establecidas por cada organizador de evento. EventPlatform no se hace responsable de las disputas de reembolso, salvo en casos de fraude técnico.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
