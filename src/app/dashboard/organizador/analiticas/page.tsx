// src/app/dashboard/organizador/analiticas/page.tsx
'use client';
import { useState, useEffect } from 'react';

interface Stats {
  ventasTotales: number;
  ingresosTotales: number;
  tasaOcupacion: number;
  promedioReservasPorEvento: number;
  totalEventos: number;
}

interface EventoVendido {
  id: string;
  nombre: string;
  ventas: number;
  ingresos: number;
  boletos: number;
}

interface VentaCategoria {
  categoria: string;
  ventas: number;
  ingresos: number;
  porcentaje: number;
}

interface TendenciaVenta {
  fecha: string;
  cantidad: number;
}

export default function AnaliticasPage() {
  const [periodo, setPeriodo] = useState('mes');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    ventasTotales: 0,
    ingresosTotales: 0,
    tasaOcupacion: 0,
    promedioReservasPorEvento: 0,
    totalEventos: 0,
  });
  const [eventosMasVendidos, setEventosMasVendidos] = useState<EventoVendido[]>([]);
  const [ventasPorCategoria, setVentasPorCategoria] = useState<VentaCategoria[]>([]);
  const [tendenciaVentas, setTendenciaVentas] = useState<TendenciaVenta[]>([]);

  useEffect(() => {
    cargarAnaliticas();
  }, [periodo]);

  const cargarAnaliticas = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(
        `/api/organizador/analiticas?organizador_id=${user.id}&periodo=${periodo}`
      );
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setEventosMasVendidos(data.eventosMasVendidos);
        setVentasPorCategoria(data.ventasPorCategoria);
        setTendenciaVentas(data.tendenciaVentas);
      }
    } catch (error) {
      console.error('Error cargando analíticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearPrecio = (precio: number) => {
    if (precio >= 1000000) {
      return `$${(precio / 1000000).toFixed(1)}M`;
    }
    return `$${precio.toLocaleString('es-CO')}`;
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
        <h1 className="text-3xl font-bold text-white">Analíticas</h1>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="px-4 py-2 bg-neutral-800 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <p className="text-gray-400 text-sm">Total de Reservas</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.ventasTotales}</p>
          <p className="text-gray-500 text-sm mt-1">{stats.totalEventos} eventos</p>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Ingresos Totales</p>
          <p className="text-3xl font-bold text-white mt-2">
            {formatearPrecio(stats.ingresosTotales)}
          </p>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Tasa de Ocupación</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.tasaOcupacion}%</p>
          <div className="w-full bg-neutral-700 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(stats.tasaOcupacion, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Promedio por Evento</p>
          <p className="text-3xl font-bold text-white mt-2">
            {stats.promedioReservasPorEvento.toFixed(1)}
          </p>
          <p className="text-gray-500 text-sm mt-1">reservas/evento</p>
        </div>
      </div>

      {/* Eventos más vendidos */}
      <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Eventos Más Vendidos</h2>
        {eventosMasVendidos.length > 0 ? (
          <div className="space-y-3">
            {eventosMasVendidos.map((evento, index) => (
              <div key={evento.id} className="flex items-center justify-between p-4 bg-neutral-900 rounded">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="text-white font-medium">{evento.nombre}</p>
                    <p className="text-gray-400 text-sm">
                      {evento.ventas} reservas • {evento.boletos} boletos
                    </p>
                  </div>
                </div>
                <p className="text-green-400 font-semibold">{formatearPrecio(evento.ingresos)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No hay datos de ventas en este período</p>
        )}
      </div>

      {/* Ventas por categoría */}
      {ventasPorCategoria.length > 0 && (
        <div className="bg-neutral-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Ventas por Categoría</h2>
          <div className="space-y-4">
            {ventasPorCategoria.map((cat, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-white">{cat.categoria}</span>
                  <span className="text-gray-400">
                    {cat.ventas} ventas ({cat.porcentaje.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(cat.porcentaje, 100)}%` }}
                  ></div>
                </div>
                <p className="text-gray-500 text-sm mt-1">{formatearPrecio(cat.ingresos)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tendencia de ventas (últimos 30 días) */}
      {tendenciaVentas.length > 0 && (
        <div className="bg-neutral-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            Tendencia de Ventas (Últimos 30 días)
          </h2>
          <div className="h-64 flex items-end justify-between space-x-1">
            {tendenciaVentas.slice(-15).map((venta, index) => {
              const maxVentas = Math.max(...tendenciaVentas.map((v) => v.cantidad));
              const altura = maxVentas > 0 ? (venta.cantidad / maxVentas) * 100 : 0;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-600 rounded-t hover:bg-blue-500 transition-all cursor-pointer"
                    style={{ height: `${altura}%` }}
                    title={`${venta.fecha}: ${venta.cantidad} reservas`}
                  ></div>
                  <span className="text-gray-500 text-xs mt-2 rotate-45 origin-left">
                    {new Date(venta.fecha).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats.totalEventos === 0 && (
        <div className="bg-neutral-800 p-12 rounded-lg text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-400 text-lg mb-4">No hay datos de analíticas aún</p>
          <a
            href="/dashboard/organizador/crear"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
          >
            Crear tu primer evento
          </a>
        </div>
      )}
    </div>
  );
}
