'use client';
import { useState, useEffect } from 'react';
import { User, Bell, Shield, Save, Mail, Phone, Lock, LogOut } from 'lucide-react';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('perfil');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const handleSave = () => {
        setLoading(true);
        // Simular guardado
        setTimeout(() => {
            setLoading(false);
            alert('Cambios guardados correctamente');
        }, 1000);
    };

    if (!user) return null;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Configuración</h2>
                <p className="text-gray-400">Administra tu cuenta y preferencias</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar de Configuración */}
                <div className="lg:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('perfil')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'perfil'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <User size={20} />
                        <span className="font-medium">Perfil</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('notificaciones')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'notificaciones'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Bell size={20} />
                        <span className="font-medium">Notificaciones</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('seguridad')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'seguridad'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Shield size={20} />
                        <span className="font-medium">Seguridad</span>
                    </button>
                </div>

                {/* Contenido Principal */}
                <div className="lg:col-span-3">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-xl">
                        {activeTab === 'perfil' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
                                        {user.nombre?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium">
                                            Cambiar Foto
                                        </button>
                                        <p className="text-xs text-gray-500 mt-2">JPG, GIF o PNG. Máx 1MB.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Nombre Completo</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                type="text"
                                                defaultValue={user.nombre}
                                                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Correo Electrónico</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                type="email"
                                                defaultValue={user.email}
                                                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Teléfono</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                type="tel"
                                                placeholder="+57 300 123 4567"
                                                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Rol</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                type="text"
                                                value={user.tipo_usuario}
                                                disabled
                                                className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/5 rounded-xl text-gray-500 cursor-not-allowed capitalize"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notificaciones' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-white mb-4">Preferencias de Notificación</h3>
                                <div className="space-y-4">
                                    {['Correos promocionales', 'Nuevos eventos', 'Recordatorios de reserva', 'Actualizaciones de seguridad'].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                            <span className="text-gray-300">{item}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked={i > 0} />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'seguridad' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-white mb-4">Seguridad de la Cuenta</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                        <div className="flex gap-3">
                                            <Lock className="text-blue-400 shrink-0" size={24} />
                                            <div>
                                                <h4 className="text-blue-400 font-medium mb-1">Contraseña Segura</h4>
                                                <p className="text-sm text-gray-400">Tu contraseña fue actualizada hace 3 meses. Se recomienda cambiarla periódicamente.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full py-3 border border-white/10 hover:bg-white/5 text-white rounded-xl transition-colors font-medium">
                                        Cambiar Contraseña
                                    </button>

                                    <div className="pt-4 border-t border-white/5">
                                        <button className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium">
                                            <LogOut size={16} />
                                            Cerrar todas las sesiones activas
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-4">
                            <button className="px-6 py-2 text-gray-400 hover:text-white transition-colors font-medium">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Save size={18} />
                                )}
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
