// src/app/dashboard/organizador/analiticas/page.tsx
'use client';
import { useState } from 'react';

export default function AnaliticasPage() {
  const [periodo, setPeriodo] = useState('mes');

  const stats = {
    ventasTotales: 234,
    ingresosTotales: 18330000,
    tasaOcupacion: 73,
    promedioReservasPorEvento: 47,
  };

  const eventosMasVendidos = [
    { nombre: 'Tech Summit 2024', ventas: 150, ingresos: 11250000 },
    { nombre: 'Festival de Música', ventas: 84, ingresos: 6720000 },
    { nombre: 'Taller de Acuarela', ventas: 12, ingresos: 360000 },
  ];

  const ventasPorCategoria = [
    { categoria: 'Tecnología', ventas: 150, porcentaje: 64 },
    { categoria: 'Música', ventas: 84, porcentaje: 36 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Analíticas</h1>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="px-4 py-2 bg-neutral-800 text-white rounded border border-neutral-700"
        >
          <option value="semana">Última semana</option>
          <option value="mes">Último mes</option>
          <option value="trimestre">Último trimestre</option>
          <option value="año">Último año</option>
        </select>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Ventas Totales</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.ventasTotales}</p>
          <p className="text-green-400 text-sm mt-1">↑ 12% vs mes anterior</p>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Ingresos Totales</p>
          <p className="text-3xl font-bold text-white mt-2">
            ${(stats.ingresosTotales / 1000000).toFixed(1)}M
          </p>
          <p className="text-green-400 text-sm mt-1">↑ 8% vs mes anterior</p>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Tasa de Ocupación</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.tasaOcupacion}%</p>
          <p className="text-yellow-400 text-sm mt-1">↓ 3% vs mes anterior</p>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Promedio por Evento</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.promedioReservasPorEvento}</p>
          <p className="text-green-400 text-sm mt-1">↑ 5% vs mes anterior</p>
        </div>
      </div>

      {/* Eventos más vendidos */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          Eventos Más Vendidos
        </h2>
        <div className="space-y-3">
          {eventosMasVendidos.map((evento, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                <div>
                  <p className="text-white font-medium">{evento.nombre}</p>
                  <p className="text-gray-400 text-sm">{evento.ventas} ventas</p>
                </div>
              </div>
              <p className="text-green-400 font-semibold">
                ${(evento.ingresos / 1000000).toFixed(1)}M
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Ventas por categoría */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          Ventas por Categoría
        </h2>
        <div className="space-y-4">
          {ventasPorCategoria.map((cat, index) => (
            <div key={index}>
              <div className="flex justify-between mb-2">
                <span className="text-white">{cat.categoria}</span>
                <span className="text-gray-400">{cat.ventas} ventas ({cat.porcentaje}%)</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${cat.porcentaje}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico placeholder */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          Tendencia de Ventas
        </h2>
        <div className="h-64 flex items-center justify-center bg-neutral-900 rounded">
          <p className="text-gray-500">
            Gráfico de líneas (próximamente con Chart.js o Recharts)
          </p>
        </div>
      </div>
    </div>
  );
}
