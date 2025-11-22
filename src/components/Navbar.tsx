// src/components/Navbar.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, LayoutDashboard, Compass, Home, Bell, LogIn, UserPlus, MessageCircle } from 'lucide-react';
import NotificationBell from './NotificationBell';
import FavoritesButton from './FavoritesButton';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      setUser(null);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Polling para mensajes de chat (Usuario normal)
  useEffect(() => {
    if (!user || user.tipo_usuario === 'admin') return;

    const checkMessages = async () => {
      try {
        const res = await fetch(`/api/chat/status?usuario_id=${user.id}`);
        const data = await res.json();

        if (data.success && data.hasMessages && data.esRespuesta) {
          const lastRead = localStorage.getItem('lastReadChatTime');
          const messageTime = new Date(data.lastMessageAt).getTime();

          if (!lastRead || messageTime > parseInt(lastRead)) {
            setHasUnreadMessages(true);
          } else {
            setHasUnreadMessages(false);
          }
        }
      } catch (error) {
        console.error('Error checking messages:', error);
      }
    };

    checkMessages();
    const interval = setInterval(checkMessages, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const navLinks = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/explorar', label: 'Explorar', icon: Compass },
  ];

  // Hide Navbar on dashboard
  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-white/10 py-2' : 'bg-transparent py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo.svg"
              alt="Logo"
              className="w-8 h-8 rounded-lg shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all"
            />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden sm:block">
              EventPlatform
            </span>
          </Link>

          {/* Mobile Navigation (Icons only) */}
          <div className="flex md:hidden items-center gap-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`p-2 rounded-full transition-all ${isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  aria-label={link.label}
                >
                  <Icon size={20} />
                </Link>
              );
            })}
            {user && (
              <Link
                href={`/dashboard/${user.tipo_usuario}`}
                className={`p-2 rounded-full transition-all ${pathname.includes('/dashboard')
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                aria-label="Dashboard"
              >
                <LayoutDashboard size={20} />
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                    ? 'bg-white/10 text-white shadow-inner'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}

            {user && (
              <Link
                href={`/dashboard/${user.tipo_usuario}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${pathname.includes('/dashboard')
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            )}
          </div>

          {/* User / Auth buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {user.tipo_usuario === 'asistente' && <FavoritesButton userId={user.id} />}

                {/* Chat Notification for non-admins */}
                {user.tipo_usuario !== 'admin' && (
                  <Link
                    href="/dashboard/ayuda"
                    className="relative p-2 text-gray-300 hover:text-white transition-colors"
                    onClick={() => {
                      localStorage.setItem('lastReadChatTime', Date.now().toString());
                      setHasUnreadMessages(false);
                    }}
                  >
                    <MessageCircle size={20} />
                    {hasUnreadMessages && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0a0a]"></span>
                    )}
                  </Link>
                )}

                <NotificationBell userId={user.id} />

                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                  >
                    {user.foto_perfil_url ? (
                      <img
                        src={user.foto_perfil_url}
                        alt={user.nombre}
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        {user.nombre?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-gray-200 max-w-[100px] truncate hidden sm:block">
                      {user.nombre}
                    </span>
                  </button>

                  {showDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-[#121212] border border-white/10 rounded-xl shadow-2xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                          {user.foto_perfil_url ? (
                            <img
                              src={user.foto_perfil_url}
                              alt={user.nombre}
                              className="w-10 h-10 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                              {user.nombre?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="text-sm text-white font-medium truncate">{user.nombre}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="p-2">
                          <Link
                            href={`/dashboard/${user.tipo_usuario}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <LayoutDashboard size={16} />
                            Mi Dashboard
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                          >
                            <LogOut size={16} />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Desktop Auth */}
                <Link
                  href="/login"
                  className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  className="hidden sm:block px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-full shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  Registrarse
                </Link>

                {/* Mobile Auth Icons */}
                <Link
                  href="/login"
                  className="sm:hidden p-2 text-gray-300 hover:text-white transition-colors"
                  aria-label="Iniciar Sesión"
                >
                  <LogIn size={20} />
                </Link>
                <Link
                  href="/registro"
                  className="sm:hidden p-2 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                  aria-label="Registrarse"
                >
                  <UserPlus size={20} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
