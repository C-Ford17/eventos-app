// src/components/Navbar.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, [pathname]); // Revalida cuando cambia la ruta

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="bg-neutral-900 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y links principales */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-white">
              EventPlatform
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-white px-3 py-2 rounded transition"
              >
                Inicio
              </Link>
              <Link
                href="/explorar"
                className="text-gray-300 hover:text-white px-3 py-2 rounded transition"
              >
                Explorar eventos
              </Link>
              {user && (
                <Link
                  href={`/dashboard/${user.tipo_usuario}`}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded transition"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Usuario / Auth buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded transition"
                >
                  <span className="text-sm">{user.email}</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 text-sm text-gray-400 border-b border-neutral-700">
                      {user.nombre}
                    </div>
                    <Link
                      href={`/dashboard/${user.tipo_usuario}`}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-neutral-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      Mi Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-700"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white px-4 py-2 rounded transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
