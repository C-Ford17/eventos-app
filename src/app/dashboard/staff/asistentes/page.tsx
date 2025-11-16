// src/app/dashboard/staff/asistentes/page.tsx
'use client';
import { useState } from 'react';

export default function ListaAsistentesPage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const asistentes = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan@email.com',
      entrada: 'VIP',
      codigo: 'QR-123456',
      estado: 'validado',
      horaValidacion: '14:30:00',
    },
    {
      id: 2,
      nombre: 'María González',
      email: 'maria@email.com',
      entrada: 'General',
      codigo: 'QR-789012',
      estado: 'validado',
      horaValidacion: '14:25:00',
    },
    {
      id: 3,
      nombre: 'Carlos Rodríguez',
      email: 'carlos@email.com',
      entrada: 'General',
      codigo: 'QR-345678',
      estado: 'pendiente',
      horaValidacion: null,
    },
    {
      id: 4,
      nombre: 'Ana Martínez',
      email: 'ana@email.com',
      entrada: 'Estudiante',
      codigo: 'QR-901234',
      estado: 'validado',
      horaValidacion: '14:20:00',
    },
    {
      id: 5,
      nombre: 'Pedro Sánchez',
      email: 'pedro@email.com',
      entrada: 'General',
      codigo: 'QR-567890',
      estado: 'pendiente',
      horaValidacion: null,
    },
  ];

  const asistentesFiltrados = asistentes.filter(asistente => {
    const matchBusqueda =
      asistente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      asistente.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      asistente.codigo.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstado = filtroEstado === 'todos' || asistente.estado === filtroEstado;

    return matchBusqueda && matchEstado;
  });

  const totalValidados = asistentes.filter(a => a.estado === 'validado').length;
  const totalPendientes = asistentes.filter(a => a.estado === 'pendiente').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Lista de Asistentes</h1>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Total Registrados</p>
          <p className="text-3xl font-bold text-white">{asistentes.length}</p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Validados</p>
          <p className="text-3xl font-bold text-green-400">{totalValidados}</p>
        </div>
        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-400">{totalPendientes}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-neutral-800 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Buscar por nombre, email o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="px-4 py-3 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-3 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="validado">Validados</option>
            <option value="pendiente">Pendientes</option>
          </select>
        </div>
      </div>

      {/* Tabla de asistentes */}
      <div className="bg-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Entrada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Hora
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {asistentesFiltrados.map((asistente) => (
              <tr key={asistente.id} className="hover:bg-neutral-700">
                <td className="px-6 py-4 whitespace-nowrap text-white">
                  {asistente.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {asistente.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {asistente.entrada}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300 font-mono text-sm">
                  {asistente.codigo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {asistente.estado === 'validado' ? (
                    <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                      Validado
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-full">
                      Pendiente
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                  {asistente.horaValidacion || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {asistentesFiltrados.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No se encontraron asistentes con los filtros seleccionados
        </div>
      )}
    </div>
  );
}
