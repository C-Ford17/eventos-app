// src/app/dashboard/staff/reportes/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useStaff } from '@/contexts/StaffContext';
import EventoSelector from '@/components/EventoSelector';

interface ReporteData {
  stats: {
    totalReservas: number;
    totalValidados: number;
    totalPendientes: number;
    porcentajeValidacion: number;
  };
  validacionesPorHora: Array<{
    hora: string;
    cantidad: number;
  }>;
  tiposEntrada: Array<{
    tipo: string;
    vendidas: number;
    validadas: number;
    porcentaje: number;
  }>;
}

export default function ReportesPage() {
  const { eventoSeleccionado, eventoActual } = useStaff();
  const [loading, setLoading] = useState(false);
  const [reporte, setReporte] = useState<ReporteData | null>(null);

  useEffect(() => {
    if (eventoSeleccionado) {
      cargarReporte();
    }
  }, [eventoSeleccionado]);

  const cargarReporte = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/eventos/${eventoSeleccionado}/reportes`);
      const data = await response.json();
      
      if (data.success) {
        setReporte(data.reporte);
      }
    } catch (error) {
      console.error('Error cargando reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    // TODO: Implementar exportación a Excel
    alert('Exportación a Excel - Por implementar');
  };

  const exportarPDF = () => {
    // TODO: Implementar exportación a PDF
    alert('Exportación a PDF - Por implementar');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Reportes</h1>
      </div>

      {/* Selector de evento */}
      <EventoSelector />

      {reporte ? (
        <>
          {/* Resumen general */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-neutral-800 p-6 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">Total Reservas</p>
              <p className="text-3xl font-bold text-white">{reporte.stats.totalReservas}</p>
            </div>
            <div className="bg-neutral-800 p-6 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">Validados</p>
              <p className="text-3xl font-bold text-green-400">{reporte.stats.totalValidados}</p>
              <p className="text-green-400 text-sm mt-1">↑ {reporte.stats.porcentajeValidacion}%</p>
            </div>
            <div className="bg-neutral-800 p-6 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-400">{reporte.stats.totalPendientes}</p>
            </div>
            <div className="bg-neutral-800 p-6 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">Tasa de Validación</p>
              <p className="text-3xl font-bold text-white">{reporte.stats.porcentajeValidacion}%</p>
            </div>
          </div>

          {/* Validaciones por hora */}
          <div className="bg-neutral-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">
              Validaciones por Hora
            </h2>
            {reporte.validacionesPorHora.length > 0 ? (
              <div className="space-y-3">
                {reporte.validacionesPorHora.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">{item.hora}</span>
                      <span className="text-white font-semibold">{item.cantidad} validaciones</span>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min((item.cantidad / Math.max(...reporte.validacionesPorHora.map(v => v.cantidad))) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No hay validaciones registradas aún
              </p>
            )}
          </div>

          {/* Entradas por tipo */}
          {reporte.tiposEntrada.length > 0 && (
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
                    {reporte.tiposEntrada.map((entrada, index) => (
                      <tr key={index} className="border-b border-neutral-700">
                        <td className="px-4 py-4 text-white">{entrada.tipo}</td>
                        <td className="px-4 py-4 text-gray-300">{entrada.vendidas}</td>
                        <td className="px-4 py-4 text-green-400 font-semibold">{entrada.validadas}</td>
                        <td className="px-4 py-4 text-white">{entrada.porcentaje.toFixed(1)}%</td>
                        <td className="px-4 py-4">
                          <div className="w-full bg-neutral-700 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
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
          )}

          {/* Información del evento */}
          {eventoActual && (
            <div className="bg-neutral-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Información del Evento
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <p className="text-gray-400 text-sm">Nombre del evento</p>
                  <p className="text-white font-medium">{eventoActual.nombre}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Fecha</p>
                  <p className="text-white font-medium">
                    {new Date(eventoActual.fecha_inicio).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Ubicación</p>
                  <p className="text-white font-medium">{eventoActual.ubicacion}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Aforo máximo</p>
                  <p className="text-white font-medium">{eventoActual.aforo_max}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex space-x-4">
            <button 
              onClick={exportarExcel}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar a Excel
            </button>
            <button 
              onClick={exportarPDF}
              className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-semibold transition flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Exportar a PDF
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">Selecciona un evento para ver los reportes</p>
        </div>
      )}
    </div>
  );
}
