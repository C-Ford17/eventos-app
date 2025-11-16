// src/app/dashboard/staff/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StaffPanel() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  // Datos de ejemplo del evento actual
  const eventoActual = {
    nombre: 'Evento Anual 2024',
    fecha: '2024-11-16',
    asistentesRegistrados: 678,
    aforoTotal: 1500,
    entradasValidadas: 423,
    porcentajeOcupacion: 45,
  };

  const actividadReciente = [
    { nombre: 'Alejandro Vargas', hora: '14:32:15', estado: 'exitoso' },
    { nombre: 'Entrada Duplicada', hora: '14:31:59', estado: 'error' },
    { nombre: 'Mariana Fuentes', hora: '14:31:40', estado: 'exitoso' },
    { nombre: 'Javier Torres', hora: '14:30:11', estado: 'exitoso' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Control de Acceso</h1>
        <p className="text-gray-400">
          Gestiona el acceso de asistentes al evento
        </p>
      </div>

      {/* Evento actual */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Evento Actual</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">{eventoActual.nombre}</p>
            <p className="text-gray-400">
              {new Date(eventoActual.fecha).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <Link
            href="/dashboard/staff/escanear"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Escanear Entradas
          </Link>
        </div>
      </div>

      {/* Estadísticas en tiempo real */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Asistentes Registrados</p>
          <p className="text-3xl font-bold text-white">
            {eventoActual.asistentesRegistrados} / {eventoActual.aforoTotal}
          </p>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Entradas Validadas</p>
          <p className="text-3xl font-bold text-green-400">
            {eventoActual.entradasValidadas}
          </p>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Ocupación Actual</p>
          <p className="text-3xl font-bold text-white">
            {eventoActual.porcentajeOcupacion}%
          </p>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-400">
            {eventoActual.asistentesRegistrados - eventoActual.entradasValidadas}
          </p>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h2>
        <div className="space-y-3">
          {actividadReciente.map((actividad, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-neutral-900 rounded"
            >
              <div className="flex items-center space-x-3">
                {actividad.estado === 'exitoso' ? (
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{actividad.nombre}</p>
                  <p className="text-gray-400 text-sm">{actividad.hora}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/staff/asistentes"
          className="bg-neutral-800 p-6 rounded-lg hover:bg-neutral-700 transition"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-900 rounded flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Lista de Asistentes</p>
              <p className="text-gray-400 text-sm">Ver todos los registrados</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/staff/reportes"
          className="bg-neutral-800 p-6 rounded-lg hover:bg-neutral-700 transition"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-900 rounded flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Reportes</p>
              <p className="text-gray-400 text-sm">Estadísticas del evento</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
