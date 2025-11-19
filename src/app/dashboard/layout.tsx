// src/app/dashboard/layout.tsx
'use client';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Bell, Search, User } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 ml-20 md:ml-72 p-8 transition-all duration-300 relative z-10">
        {/* Topbar */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Bienvenido, <span className="text-blue-400">{user?.nombre?.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-400 text-sm">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                      <h3 className="font-semibold text-white">Notificaciones</h3>
                      <span className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">Marcar leídas</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {user?.tipo_usuario === 'asistente' && (
                        <>
                          <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex gap-3">
                              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                              <div>
                                <p className="text-sm text-gray-200">¡Tu evento "Concierto de Rock" es mañana!</p>
                                <p className="text-xs text-gray-500 mt-1">Hace 2 horas</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex gap-3">
                              <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0" />
                              <div>
                                <p className="text-sm text-gray-200">Pago confirmado para "Feria de Arte"</p>
                                <p className="text-xs text-gray-500 mt-1">Ayer</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {user?.tipo_usuario === 'organizador' && (
                        <>
                          <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex gap-3">
                              <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0" />
                              <div>
                                <p className="text-sm text-gray-200">Nueva reserva para "Festival de Verano"</p>
                                <p className="text-xs text-gray-500 mt-1">Hace 10 minutos</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex gap-3">
                              <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500 shrink-0" />
                              <div>
                                <p className="text-sm text-gray-200">Stock bajo de boletos VIP</p>
                                <p className="text-xs text-gray-500 mt-1">Hace 1 hora</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {user?.tipo_usuario === 'proveedor' && (
                        <>
                          <Link href="/dashboard/proveedor/solicitudes" onClick={() => setIsNotificationsOpen(false)}>
                            <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                              <div className="flex gap-3">
                                <div className="w-2 h-2 mt-2 rounded-full bg-purple-500 shrink-0" />
                                <div>
                                  <p className="text-sm text-gray-200">Nueva solicitud de servicio: Catering</p>
                                  <p className="text-xs text-gray-500 mt-1">Hace 30 minutos</p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </>
                      )}

                      {user?.tipo_usuario === 'staff' && (
                        <>
                          <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex gap-3">
                              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                              <div>
                                <p className="text-sm text-gray-200">Juan Pérez ha ingresado al evento</p>
                                <p className="text-xs text-gray-500 mt-1">Hace 1 minuto</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="p-4 text-center">
                        <p className="text-xs text-gray-500">No hay más notificaciones</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                {user?.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">{user?.nombre}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.tipo_usuario}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
