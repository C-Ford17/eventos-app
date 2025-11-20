// src/app/dashboard/layout.tsx
'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, User, Menu } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import Sidebar, { toggleMobileSidebar } from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
      <main className="flex-1 md:ml-20 lg:ml-72 p-4 md:p-8 transition-all duration-300 relative z-10">
        {/* Topbar */}
        <header className="flex justify-between items-center mb-8">
          {/* Hamburger Menu - Mobile Only */}
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
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
            {user && <NotificationBell userId={user.id} />}

            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              {user?.foto_perfil_url ? (
                <img
                  src={user.foto_perfil_url}
                  alt={user.nombre}
                  className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-lg"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.nombre?.charAt(0).toUpperCase()}
                </div>
              )}
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
