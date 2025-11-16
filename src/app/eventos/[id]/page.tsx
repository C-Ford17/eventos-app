// src/app/eventos/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DetalleEventoPage() {
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  // Datos de ejemplo - luego vendrán de la API
  const evento = {
    id: eventoId,
    nombre: 'Tech Summit 2024',
    descripcion: 'Sumérgete en el futuro de la tecnología con las mentes más brillantes de la industria. Tech Summit 2024 trae conferencias magistrales, talleres prácticos y oportunidades de networking con líderes tecnológicos de todo el mundo.',
    fechaInicio: '2024-11-01T10:00:00',
    fechaFin: '2024-11-03T18:00:00',
    lugar: 'Centro de Convenciones',
    direccion: 'Calle 100 #15-20, Bogotá',
    categoria: 'Tecnología',
    imagen: 'https://via.placeholder.com/1200x600?text=Tech+Summit+2024',
    organizador: 'Tech Events Co.',
    aforo: 200,
    reservas: 150,
    tiposEntrada: [
      {
        id: 1,
        nombre: 'Entrada General',
        precio: 75000,
        descripcion: 'Acceso a todas las conferencias y talleres',
        disponibles: 30,
      },
      {
        id: 2,
        nombre: 'Entrada VIP',
        precio: 150000,
        descripcion: 'Incluye almuerzo, zona exclusiva y kit de bienvenida',
        disponibles: 15,
      },
      {
        id: 3,
        nombre: 'Entrada Estudiante',
        precio: 40000,
        descripcion: 'Con carnet estudiantil vigente',
        disponibles: 5,
      },
    ],
  };

  const handleComprar = () => {
    // Verifica si el usuario está logueado
    if (!user) {
      // Guarda la URL actual para redirigir después del login
      localStorage.setItem('redirectAfterLogin', `/eventos/${eventoId}`);
      router.push('/login');
      return;
    }

    // Verifica el tipo de usuario
    if (user.tipo_usuario === 'organizador' || user.tipo_usuario === 'proveedor') {
      alert('Solo los asistentes pueden comprar boletos. Tu cuenta es de tipo: ' + user.tipo_usuario);
      return;
    }

    // Si es asistente, redirige a la selección de entradas
    router.push(`/eventos/${eventoId}/comprar`);
  };

  const disponibilidad = evento.aforo - evento.reservas;
  const porcentajeOcupacion = (evento.reservas / evento.aforo) * 100;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Imagen principal */}
      <div className="relative h-96 bg-neutral-800">
        <img
          src={evento.imagen}
          alt={evento.nombre}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <span className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full">
              {evento.categoria}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal - Información del evento */}
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
                  <span>{evento.organizador}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{evento.reservas} asistentes confirmados</span>
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
              <div className="space-y-3">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-white font-medium">{evento.lugar}</p>
                    <p className="text-gray-400">{evento.direccion}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 h-48 bg-neutral-700 rounded flex items-center justify-center">
                <p className="text-gray-500">Mapa (próximamente con Google Maps)</p>
              </div>
            </div>

            <div className="bg-neutral-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Tipos de Entrada
              </h2>
              <div className="space-y-4">
                {evento.tiposEntrada.map((entrada) => (
                  <div key={entrada.id} className="flex justify-between items-center p-4 bg-neutral-900 rounded">
                    <div>
                      <h3 className="text-white font-semibold">{entrada.nombre}</h3>
                      <p className="text-gray-400 text-sm">{entrada.descripcion}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Disponibles: {entrada.disponibles}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        ${entrada.precio.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna lateral - Card de compra */}
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
                  {new Date(evento.fechaInicio).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-gray-400">
                  {new Date(evento.fechaInicio).toLocaleTimeString('es-ES', {
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
                    className={`h-3 rounded-full ${
                      porcentajeOcupacion > 80 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${porcentajeOcupacion}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Precio desde</p>
                <p className="text-4xl font-bold text-white">
                  ${Math.min(...evento.tiposEntrada.map(e => e.precio)).toLocaleString('es-CO')}
                </p>
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

              <div className="mt-6 pt-6 border-t border-neutral-700 space-y-3">
                <div className="flex items-center text-gray-300 text-sm">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Confirmación inmediata
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Boleto electrónico
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Soporte 24/7
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
