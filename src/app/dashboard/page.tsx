'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí debes obtener el usuario logueado
    // Por ahora, lo simulamos obteniendo del localStorage
    // (más adelante puedes usar NextAuth session o context)
    console.log('Dashboard page: verificando usuario...'); // Debug
    const userStr = localStorage.getItem('user');
    console.log('Usuario en localStorage:', userStr); // Debug

    if (!userStr) {
      // Si no hay usuario, redirige al login
      console.log('No hay usuario, redirigiendo a login'); // Debug
      router.push('/login');
      router.refresh();
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const tipoUsuario = user.tipo_usuario;

      // Redirige según el tipo de usuario
      switch(tipoUsuario) {
        case 'organizador':
          console.log('Redirigiendo a organizador'); // Debug
          router.push('/dashboard/organizador');
          break;
        case 'proveedor':
          console.log('Redirigiendo a proveedor'); // Debug
          router.push('/dashboard/proveedor');
          break;
        case 'asistente':
          console.log('Redirigiendo a asistente'); // Debug
          router.push('/dashboard/asistente');
          break;
        default:
          console.error('Tipo de usuario desconocido:', tipoUsuario);
          router.push('/login');
      }
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-400">Cargando dashboard...</p>
      </div>
    </div>
  );
}
