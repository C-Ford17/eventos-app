// src/app/dashboard/staff/reportes/page.tsx
'use client';
import { useState } from 'react';

export default function ReportesPage() {
  const [periodo, setPeriodo] = useState('hoy');

  // Datos de ejemplo
  const stats = {
    totalRegistrados: 678,
    totalValidados: 423,
    totalPendientes: 255,
    porcentajeValidacion: 62.4,
  };

  const validacionesPorHora = [
    { hora: '12:00', cantidad: 15 },
    { hora: '13:00', cantidad: 45 },
    { hora: '14:00', cantidad: 120 },
    { hora: '15:00', cantidad: 95 },
    { hora: '16:00', cantidad: 78 },
    { hora: '17:00', cantidad: 70 },
  ];

  const entradasPorTipo = [
    { tipo: 'General', vendidas: 350, validadas: 220, porcentaje: 62.9 },
    { tipo: 'VIP', vendidas: 150, validadas: 105, porcentaje: 70 },
    { tipo: 'Estudiante', vendidas: 178, validadas: 98, porcentaje: 55.1 },
  ];

  const horasPico = [
    { rango: '14:00 - 15:00', asistentes: 120, porcentaje: 28.4 },
    { rango: '13:00 - 14:00', asistentes: 95, porcentaje: 22.5 },
    { rango: '15:00 - 16:00', asistentes: 78, porcentaje: 18.4 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Reportes</h1>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="px-4 py-2 bg-neutral-800 text-white rounded border border-neutral-700"
        >
          <option value="hoy">Hoy</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mes</option>
        </select>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Total Registrados</p>
          <p className="text-3xl font-bold text-white">{stats.totalRegistrados}</p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Validados</p>
          <p className="text-3xl font-bold text-green-400">{stats.totalValidados}</p>
          <p className="text-green-400 text-sm mt-1">↑ {stats.porcentajeValidacion}%</p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.totalPendientes}</p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Tasa de Validación</p>
          <p className="text-3xl font-bold text-white">{stats.porcentajeValidacion}%</p>
        </div>
      </div>

      {/* Validaciones por hora */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          Validaciones por Hora
        </h2>
        <div className="space-y-3">
          {validacionesPorHora.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">{item.hora}</span>
                <span className="text-white font-semibold">{item.cantidad} validaciones</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${(item.cantidad / 120) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Entradas por tipo */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          Validación por Tipo de Entrada
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="px-4 py-3 text-left text-gray-400 text-sm">Tipo</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm">Vendidas</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm">Validadas</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm">Porcentaje</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm">Progreso</th>
              </tr>
            </thead>
            <tbody>
              {entradasPorTipo.map((entrada, index) => (
                <tr key={index} className="border-b border-neutral-700">
                  <td className="px-4 py-4 text-white">{entrada.tipo}</td>
                  <td className="px-4 py-4 text-gray-300">{entrada.vendidas}</td>
                  <td className="px-4 py-4 text-green-400 font-semibold">{entrada.validadas}</td>
                  <td className="px-4 py-4 text-white">{entrada.porcentaje}%</td>
                  <td className="px-4 py-4">
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${entrada.porcentaje}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Horas pico */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">
          Horas Pico de Llegada
        </h2>
        <div className="space-y-4">
          {horasPico.map((hora, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-neutral-900 rounded">
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                <div>
                  <p className="text-white font-medium">{hora.rango}</p>
                  <p className="text-gray-400 text-sm">{hora.asistentes} asistentes</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{hora.porcentaje}%</p>
                <p className="text-gray-400 text-sm">del total</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-4">
        <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
          Exportar a Excel
        </button>
        <button className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-semibold transition">
          Exportar a PDF
        </button>
      </div>
    </div>
  );
}
