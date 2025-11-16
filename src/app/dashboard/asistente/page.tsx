// src/app/dashboard/asistente/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AsistentePanel() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  // Datos de ejemplo - luego serán reales desde la API
  const stats = {
    reservasActivas: 3,
    proximosEventos: 2,
    notificacionesPendientes: 5,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          ¡Bienvenido, {user?.nombre || 'Usuario'}!
        </h1>
        <p className="text-gray-400">
          Aquí tienes un resumen de tu actividad reciente
        </p>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/asistente/reservas"
          className="bg-neutral-800 p-6 rounded-lg hover:bg-neutral-700 transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Reservas Activas</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.reservasActivas}
              </p>
            </div>
            <div className="bg-blue-600 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/asistente/boletos"
          className="bg-neutral-800 p-6 rounded-lg hover:bg-neutral-700 transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Próximos Eventos</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.proximosEventos}
              </p>
            </div>
            <div className="bg-green-600 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/asistente/notificaciones"
          className="bg-neutral-800 p-6 rounded-lg hover:bg-neutral-700 transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Notificaciones</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.notificacionesPendientes}
              </p>
            </div>
            <div className="bg-yellow-600 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Sección de eventos próximos */}
      <section className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          Próximos Eventos
        </h2>
        <div className="space-y-3">
          <div className="bg-neutral-900 p-4 rounded flex justify-between items-center">
            <div>
              <p className="text-white font-medium">Tech Summit 2024</p>
              <p className="text-gray-400 text-sm">1-3 de Noviembre</p>
            </div>
            <Link
              href="/dashboard/asistente/boletos"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Ver boleto →
            </Link>
          </div>
          <div className="bg-neutral-900 p-4 rounded flex justify-between items-center">
            <div>
              <p className="text-white font-medium">Festival de Música Electrónica</p>
              <p className="text-gray-400 text-sm">15 de Noviembre</p>
            </div>
            <Link
              href="/dashboard/asistente/boletos"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Ver boleto →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
