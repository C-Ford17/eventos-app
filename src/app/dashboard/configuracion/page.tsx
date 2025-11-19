'use client';
import { useState, useEffect, useRef } from 'react';
import { User, Bell, Shield, Save, Mail, Phone, Lock, Upload, Check, X, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('perfil');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile state
    const [profileData, setProfileData] = useState({
        nombre: '',
        email: '',
        telefono: '',
    });

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Notifications state
    const [notifications, setNotifications] = useState({
        email_promocional: true,
        nuevos_eventos: true,
        recordatorios: true,
        actualizaciones_seguridad: true,
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            setUser(userData);
            setProfileData({
                nombre: userData.nombre || '',
                email: userData.email || '',
                telefono: userData.telefono || '',
            });
        }
    }, []);

    useEffect(() => {
        if (user?.id) {
            loadNotificationPreferences();
        }
    }, [user]);

    const loadNotificationPreferences = async () => {
        try {
            const response = await fetch(`/api/users/${user.id}/notifications`);
            const data = await response.json();
            if (data.success) {
                setNotifications(data.preferences);
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleProfileUpdate = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/users/${user.id}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                showMessage('success', 'Perfil actualizado exitosamente');
            } else {
                showMessage('error', data.error || 'Error al actualizar perfil');
            }
        } catch (error) {
            showMessage('error', 'Error al actualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!user?.id) return;

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showMessage('error', 'Las contraseñas no coinciden');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showMessage('error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/users/${user.id}/password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                showMessage('success', 'Contraseña actualizada exitosamente');
            } else {
                showMessage('error', data.error || 'Error al cambiar contraseña');
            }
        } catch (error) {
            showMessage('error', 'Error al cambiar contraseña');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationUpdate = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/users/${user.id}/notifications`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notifications),
            });

            const data = await response.json();

            if (data.success) {
                showMessage('success', 'Preferencias actualizadas exitosamente');
            } else {
                showMessage('error', data.error || 'Error al actualizar preferencias');
            }
        } catch (error) {
            showMessage('error', 'Error al actualizar preferencias');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            showMessage('error', 'La imagen debe ser menor a 1MB');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file); // Changed from 'image' to 'file'

            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                await fetch(`/api/users/${user.id}/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ foto_perfil_url: data.url }), // Changed from imageUrl to url
                });

                const updatedUser = { ...user, foto_perfil_url: data.url }; // Changed from imageUrl to url
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                showMessage('success', 'Foto de perfil actualizada');
            } else {
                showMessage('error', data.error || 'Error al subir imagen');
            }
        } catch (error) {
            showMessage('error', 'Error al subir imagen');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-8">
            {/* Message Alert */}
            {message && (
                <div className={`fixed top-24 right-4 z-50 p-4 rounded-xl shadow-lg border ${message.type === 'success'
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                    } flex items-center gap-3 animate-in slide-in-from-right`}>
                    {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)}>
                        <X size={18} />
                    </button>
                </div>
            )}

            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Configuración</h2>
                <p className="text-gray-400">Administra tu cuenta y preferencias</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('perfil')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'perfil'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <User size={20} />
                        <span className="font-medium">Perfil</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('notificaciones')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'notificaciones'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Bell size={20} />
                        <span className="font-medium">Notificaciones</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('seguridad')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'seguridad'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Shield size={20} />
                        <span className="font-medium">Seguridad</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-8 shadow-xl">
                        {/* Profile Tab */}
                        {activeTab === 'perfil' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                                    <div className="relative">
                                        {user.foto_perfil_url ? (
                                            <img
                                                src={user.foto_perfil_url}
                                                alt="Profile"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-white/10"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
                                                {user.nombre?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            <Upload size={16} />
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
                                                value={profileData.nombre}
                                                onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
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
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
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
                                                value={profileData.telefono}
                                                onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
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
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleProfileUpdate}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notificaciones' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-white mb-4">Preferencias de Notificación</h3>
                                <div className="space-y-4">
                                    {[
                                        { key: 'email_promocional', label: 'Correos promocionales' },
                                        { key: 'nuevos_eventos', label: 'Nuevos eventos' },
                                        { key: 'recordatorios', label: 'Recordatorios de reserva' },
                                        { key: 'actualizaciones_seguridad', label: 'Actualizaciones de seguridad' },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                            <span className="text-gray-300">{item.label}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={notifications[item.key as keyof typeof notifications]}
                                                    onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleNotificationUpdate}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Save size={18} />
                                        )}
                                        Guardar Preferencias
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'seguridad' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-white mb-4">Seguridad de la Cuenta</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                        <div className="flex gap-3">
                                            <Lock className="text-blue-400 shrink-0" size={24} />
                                            <div>
                                                <h4 className="text-blue-400 font-medium mb-1">Contraseña Segura</h4>
                                                <p className="text-sm text-gray-400">Se recomienda usar una contraseña fuerte de al menos 6 caracteres</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Contraseña Actual</label>
                                            <input
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Nueva Contraseña</label>
                                            <input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Confirmar Nueva Contraseña</label>
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handlePasswordChange}
                                            disabled={loading}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Lock size={18} />
                                            )}
                                            Cambiar Contraseña
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
