// src/app/dashboard/organizador/servicios-contratados/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CustomDropdown from '@/components/CustomDropdown';
import { Calendar, MapPin, User, Mail, Package, DollarSign, Briefcase, Plus, Loader2 } from 'lucide-react';

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
      pendiente: {
        color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        text: 'Pendiente'
      },
      aceptado: {
        color: 'bg-green-500/10 text-green-400 border-green-500/30',
        text: 'Aceptado'
      },
      rechazado: {
        color: 'bg-red-500/10 text-red-400 border-red-500/30',
        text: 'Rechazado'
      },
      completado: {
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        text: 'Completado'
      },
    };
    const badge = badges[estado] || badges.pendiente;
    return (
      <span className={`px-3 py-1 ${badge.color} border text-xs font-semibold rounded-full`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-400 animate-pulse">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Servicios Contratados</h1>
          <p className="text-gray-400">Gestiona los servicios contratados para tus eventos</p>
        </div>
        <Link
          href="/dashboard/organizador/proveedores"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Buscar más servicios
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <Briefcase className="text-blue-400" size={20} />
          <h3 className="text-white font-semibold">Filtrar por estado</h3>
        </div>
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

      {/* Services grouped by event */}
      {serviciosPorEvento.length > 0 ? (
        <div className="space-y-6">
          {serviciosPorEvento.map((grupo) => (
            <div key={grupo.evento.id} className="bg-[#1a1a1a]/60 border border-white/10 p-8 rounded-2xl hover:border-blue-500/30 transition-all">
              {/* Event Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-6 border-b border-white/10">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-3">{grupo.evento.nombre}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-400" />
                      <span className="text-sm">
                        {new Date(grupo.evento.fecha_inicio).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-purple-400" />
                      <span className="text-sm">{grupo.evento.ubicacion}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-black/20 border border-white/5 p-6 rounded-xl text-center min-w-[180px]">
                  <p className="text-gray-400 text-sm mb-1">Total de servicios</p>
                  <p className="text-4xl font-bold text-white mb-2">{grupo.totalServicios}</p>
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign size={18} className="text-green-400" />
                    <p className="text-2xl font-bold text-green-400">
                      ${grupo.costoTotal.toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-4">
                {grupo.servicios.map((servicio) => (
                  <div
                    key={servicio.id}
                    className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 bg-black/20 border border-white/5 rounded-xl hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {servicio.productoServicio.nombre}
                        </h3>
                        {getEstadoBadge(servicio.estado_contratacion)}
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {servicio.productoServicio.descripcion}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <User size={14} className="text-blue-400" />
                          <span>{servicio.productoServicio.proveedor.nombre}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Mail size={14} className="text-purple-400" />
                          <span>{servicio.productoServicio.proveedor.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Package size={14} className="text-green-400" />
                          <span>{servicio.productoServicio.categoria}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left lg:text-right min-w-[140px]">
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                        ${Number(servicio.precio_acordado).toLocaleString('es-CO')}
                      </p>
                      <p className="text-gray-500 text-xs">
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
        <div className="bg-[#1a1a1a]/40 border border-white/5 p-16 rounded-2xl text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No tienes servicios contratados</h3>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Comienza a buscar proveedores y contrata servicios para tus eventos
          </p>
          <Link
            href="/dashboard/organizador/proveedores"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            Buscar servicios
          </Link>
        </div>
      )}
    </div>
  );
}
