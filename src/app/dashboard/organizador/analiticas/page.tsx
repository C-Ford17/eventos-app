// src/app/dashboard/organizador/analiticas/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 animate-pulse">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  // Calcular el máximo para el gráfico
  const maxVentas = Math.max(...tendenciaVentas.map((v) => v.cantidad), 1);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="text-blue-500" size={32} />
            Analíticas
          </h1>
          <p className="text-gray-400 mt-1">Resumen del rendimiento de tus eventos</p>
        </div>
        <div className="md:col-span-4 relative">
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={16} />
          <CustomDropdown
            options={[
              { value: 'semana', label: 'Última semana' },
              { value: 'mes', label: 'Último mes' },
              { value: 'trimestre', label: 'Último trimestre' },
              { value: 'año', label: 'Último año' }
            ]}
            value={periodo}
            onChange={(value) => setPeriodo(value)}
            placeholder="Seleccionar período"
            buttonClassName="pl-12"
            className="w-full"
          />
        </div>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl hover:border-blue-500/30 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
              <TrendingUp className="text-blue-500" size={24} />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-500/10 text-green-400 rounded-lg flex items-center gap-1">
              <ArrowUp size={12} /> +12%
            </span>
          </div>
          <p className="text-gray-400 text-sm font-medium">Total de Reservas</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.ventasTotales}</p>
          <p className="text-gray-500 text-xs mt-2">{stats.totalEventos} eventos activos</p>
        </div>

        <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl hover:border-green-500/30 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
              <DollarSign className="text-green-500" size={24} />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-500/10 text-green-400 rounded-lg flex items-center gap-1">
              <ArrowUp size={12} /> +8%
            </span>
          </div>
          <p className="text-gray-400 text-sm font-medium">Ingresos Totales</p>
          <p className="text-3xl font-bold text-white mt-1">
            {formatearPrecio(stats.ingresosTotales)}
          </p>
          <p className="text-gray-500 text-xs mt-2">Ingresos netos</p>
        </div>

        <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl hover:border-purple-500/30 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
              <Users className="text-purple-500" size={24} />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-lg flex items-center gap-1">
              <ArrowUp size={12} /> +2%
            </span>
          </div>
          <p className="text-gray-400 text-sm font-medium">Tasa de Ocupación</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.tasaOcupacion}%</p>
          <div className="w-full bg-white/5 rounded-full h-1.5 mt-3">
            <div
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(stats.tasaOcupacion, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl hover:border-orange-500/30 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
              <Calendar className="text-orange-500" size={24} />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-red-500/10 text-red-400 rounded-lg flex items-center gap-1">
              <ArrowDown size={12} /> -3%
            </span>
          </div>
          <p className="text-gray-400 text-sm font-medium">Promedio por Evento</p>
          <p className="text-3xl font-bold text-white mt-1">
            {stats.promedioReservasPorEvento.toFixed(1)}
          </p>
          <p className="text-gray-500 text-xs mt-2">reservas/evento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tendencia de ventas (Gráfico SVG) */}
        <div className="lg:col-span-2 bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white">Tendencia de Ventas</h2>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-sm text-gray-400">Reservas</span>
            </div>
          </div>

          {tendenciaVentas.length > 0 ? (
            <div className="h-64 w-full relative">
              {/* Eje Y (Líneas de guía) */}
              <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-600 pointer-events-none">
                {[100, 75, 50, 25, 0].map((percent) => (
                  <div key={percent} className="flex items-center w-full">
                    <span className="w-8 text-right pr-2">{Math.round((maxVentas * percent) / 100)}</span>
                    <div className="flex-1 h-px bg-white/5 border-t border-dashed border-white/5"></div>
                  </div>
                ))}
              </div>

              {/* Barras del gráfico */}
              <div className="absolute inset-0 flex items-end justify-between pl-10 pt-6 pb-6 gap-2">
                {tendenciaVentas.slice(-10).map((venta, index) => {
                  const altura = (venta.cantidad / maxVentas) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group h-full justify-end">
                      <div className="relative w-full flex justify-center items-end h-full">
                        <div
                          className="w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 group-hover:from-blue-500 group-hover:to-blue-300 relative"
                          style={{ height: `${Math.max(altura, 2)}%` }}
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {venta.cantidad} reservas
                          </div>
                        </div>
                      </div>
                      <span className="text-gray-500 text-xs mt-3 truncate w-full text-center">
                        {new Date(venta.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No hay datos suficientes para mostrar el gráfico
            </div>
          )}
        </div>

        {/* Ventas por categoría */}
        <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Ventas por Categoría</h2>
          {ventasPorCategoria.length > 0 ? (
            <div className="space-y-6">
              {ventasPorCategoria.map((cat, index) => (
                <div key={index} className="group">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300 font-medium group-hover:text-white transition-colors">{cat.categoria}</span>
                    <span className="text-gray-400 text-sm">
                      {cat.ventas} ({cat.porcentaje.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-purple-500' :
                          index === 2 ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                      style={{ width: `${Math.min(cat.porcentaje, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-500 text-xs mt-1.5 text-right">{formatearPrecio(cat.ingresos)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-500">
              No hay datos de categorías
            </div>
          )}
        </div>
      </div>

      {/* Eventos más vendidos */}
      <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Top Eventos</h2>
          <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">Ver todos</button>
        </div>

        {eventosMasVendidos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-sm border-b border-white/5">
                  <th className="pb-4 font-medium pl-4">#</th>
                  <th className="pb-4 font-medium">Evento</th>
                  <th className="pb-4 font-medium text-center">Boletos</th>
                  <th className="pb-4 font-medium text-right pr-4">Ingresos</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {eventosMasVendidos.map((evento, index) => (
                  <tr key={evento.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4 pl-4 text-gray-500 font-medium">0{index + 1}</td>
                    <td className="py-4">
                      <p className="font-medium text-white group-hover:text-blue-400 transition-colors">{evento.nombre}</p>
                      <p className="text-xs text-gray-500">{evento.ventas} reservas confirmadas</p>
                    </td>
                    <td className="py-4 text-center">
                      <span className="px-2.5 py-1 bg-white/5 rounded-lg text-sm">
                        {evento.boletos}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-4 font-medium text-green-400">
                      {formatearPrecio(evento.ingresos)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="text-gray-600" size={32} />
            </div>
            <p className="text-gray-400">No hay datos de ventas en este período</p>
          </div>
        )}
      </div>
    </div>
  );
}
