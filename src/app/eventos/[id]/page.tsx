// src/app/eventos/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DetalleEventoPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id;
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    console.log('🔍 Evento ID:', eventoId); // ← Debug
    console.log('🔗 URL:', `/api/eventos/${eventoId}`); // ← Debug

    fetch(`/api/eventos/${eventoId}`)
      .then(res => {
        console.log('📡 Response status:', res.status); // ← Debug
        return res.json();
      })
      .then(data => {
        console.log('📥 Response data:', data); // ← Debug
        if (data.success) {
          console.log('✅ Evento encontrado:', data.evento); // ← Debug
          setEvento(data.evento);
        } else {
          console.error('❌ Error del API:', data.error); // ← Debug
        }
      })
      .catch(err => console.error('❌ Error de red:', err))
      .finally(() => setLoading(false));
  }, [eventoId]);

  const handleComprar = () => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', `/eventos/${eventoId}`);
      router.push('/login');
      return;
    }

    if (user.tipo_usuario === 'organizador' || user.tipo_usuario === 'proveedor') {
      alert('Solo los asistentes pueden comprar boletos. Tu cuenta es de tipo: ' + user.tipo_usuario);
      return;
    }

    router.push(`/eventos/${eventoId}/comprar`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-xl mb-4">Evento no encontrado</p>
          <Link href="/explorar" className="text-blue-400 hover:text-blue-300">
            Volver a explorar
          </Link>
        </div>
      </div>
    );
  }

  const disponibilidad = evento.disponibilidad;
  const porcentajeOcupacion = parseFloat(evento.porcentajeOcupacion);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Imagen principal en detalles del evento */}
      <div className="relative h-96 bg-gradient-to-br from-blue-600 to-purple-600">
        {evento.imagen_url ? (
          // Imagen real del evento
          <img
            src={evento.imagen_url}
            alt={evento.nombre}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          />
        ) : (
          // Fallback
          <div className="absolute inset-0 w-full h-full flex items-center justify-center text-white/50" style={{ zIndex: 0 }}>
            <svg className="w-28 h-28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <span className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full">
              {evento.categoria.nombre}
            </span>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">
                {evento.nombre}
              </h1>
              <div className="flex items-center text-gray-400 space-x-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{evento.organizador.nombre}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{evento.totalReservas} asistentes confirmados</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Acerca del evento
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {evento.descripcion}
              </p>
            </div>

            <div className="bg-neutral-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Ubicación
              </h2>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-blue-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-white font-medium">{evento.ubicacion}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card de compra */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800 p-6 rounded-lg sticky top-4">
              <div className="mb-6">
                <div className="flex items-center text-gray-300 mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Fecha de inicio</span>
                </div>
                <p className="text-white text-lg font-semibold">
                  {new Date(evento.fecha_inicio).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-gray-400">
                  {new Date(evento.fecha_inicio).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Disponibilidad</span>
                  <span className={disponibilidad > 20 ? 'text-green-400' : 'text-yellow-400'}>
                    {disponibilidad} lugares
                  </span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${porcentajeOcupacion > 80 ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${porcentajeOcupacion}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={handleComprar}
                disabled={disponibilidad === 0}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {disponibilidad === 0 ? 'Agotado' : 'Comprar Boletos'}
              </button>

              {!user && (
                <p className="text-center text-gray-400 text-sm mt-4">
                  Inicia sesión para comprar boletos
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
