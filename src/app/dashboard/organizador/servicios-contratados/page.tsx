// src/app/dashboard/organizador/servicios-contratados/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CustomDropdown from '@/components/CustomDropdown';

interface Servicio {
  id: string;
  estado_contratacion: string;
  cantidad: number;
  precio_acordado: number;
  createdAt: string;
  evento: {
    id: string;
    nombre: string;
    fecha_inicio: string;
    ubicacion: string;
  };
  productoServicio: {
    id: string;
    nombre: string;
    descripcion: string;
    categoria: string;
    proveedor: {
      nombre: string;
      email: string;
    };
  };
}

interface ServicioPorEvento {
  evento: {
    id: string;
    nombre: string;
    fecha_inicio: string;
    ubicacion: string;
  };
  servicios: Servicio[];
  totalServicios: number;
  costoTotal: number;
}

export default function ServiciosContratadosPage() {
  const [loading, setLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [serviciosPorEvento, setServiciosPorEvento] = useState<ServicioPorEvento[]>([]);

  useEffect(() => {
    cargarServicios();
  }, [estadoFiltro]);

  const cargarServicios = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(
        `/api/organizador/servicios-contratados?organizador_id=${user.id}&estado=${estadoFiltro}`
      );
      const data = await response.json();

      if (data.success) {
        setServiciosPorEvento(data.serviciosPorEvento);
      }
    } catch (error) {
      console.error('Error cargando servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: any = {
      pendiente: { color: 'bg-yellow-600', text: 'Pendiente' },
      aceptado: { color: 'bg-green-600', text: 'Aceptado' },
      rechazado: { color: 'bg-red-600', text: 'Rechazado' },
      completado: { color: 'bg-blue-600', text: 'Completado' },
    };
    const badge = badges[estado] || badges.pendiente;
    return (
      <span className={`px-2 py-1 ${badge.color} text-white text-xs rounded`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Servicios Contratados</h1>
        <Link
          href="/dashboard/organizador/proveedores"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
        >
          Buscar más servicios
        </Link>
      </div>

      {/* Filtro por estado */}
      <div className="bg-neutral-800 p-4 rounded-lg">
        <div className="bg-neutral-800 p-4 rounded-lg">
          <CustomDropdown
            options={[
              { value: 'todos', label: 'Todos los estados' },
              { value: 'pendiente', label: 'Pendientes' },
              { value: 'aceptado', label: 'Aceptados' },
              { value: 'rechazado', label: 'Rechazados' },
              { value: 'completado', label: 'Completados' }
            ]}
            value={estadoFiltro}
            onChange={(value) => setEstadoFiltro(value)}
            placeholder="Filtrar por estado"
            className="w-full"
          />
        </div>
      </div>

      {/* Servicios agrupados por evento */}
      {serviciosPorEvento.length > 0 ? (
        <div className="space-y-6">
          {serviciosPorEvento.map((grupo) => (
            <div key={grupo.evento.id} className="bg-neutral-800 p-6 rounded-lg">
              {/* Header del evento */}
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-neutral-700">
                <div>
                  <h2 className="text-2xl font-bold text-white">{grupo.evento.nombre}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    📅 {new Date(grupo.evento.fecha_inicio).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-gray-400 text-sm">📍 {grupo.evento.ubicacion}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Total de servicios</p>
                  <p className="text-3xl font-bold text-white">{grupo.totalServicios}</p>
                  <p className="text-blue-400 text-lg font-semibold mt-1">
                    ${grupo.costoTotal.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              {/* Lista de servicios */}
              <div className="space-y-3">
                {grupo.servicios.map((servicio) => (
                  <div
                    key={servicio.id}
                    className="flex items-center justify-between p-4 bg-neutral-900 rounded hover:bg-neutral-850 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {servicio.productoServicio.nombre}
                        </h3>
                        {getEstadoBadge(servicio.estado_contratacion)}
                      </div>
                      <p className="text-gray-400 text-sm mb-1">
                        {servicio.productoServicio.descripcion}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-500">
                          👤 {servicio.productoServicio.proveedor.nombre}
                        </span>
                        <span className="text-gray-500">
                          📧 {servicio.productoServicio.proveedor.email}
                        </span>
                        <span className="text-gray-500">
                          📦 {servicio.productoServicio.categoria}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xl font-bold text-blue-400">
                        ${Number(servicio.precio_acordado).toLocaleString('es-CO')}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Solicitado: {new Date(servicio.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-neutral-800 p-12 rounded-lg text-center">
          <svg
            className="w-16 h-16 text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-gray-400 text-lg mb-4">No tienes servicios contratados</p>
          <Link
            href="/dashboard/organizador/proveedores"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
          >
            Buscar servicios
          </Link>
        </div>
      )}
    </div>
  );
}
