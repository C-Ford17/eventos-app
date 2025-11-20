'use client';
import { useState, useEffect } from 'react';
import { useStaff } from '@/contexts/StaffContext';
import EventoSelector from '@/components/EventoSelector';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from "jspdf";
import {
  FileText,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
  Info,
  MapPin,
  Ticket,
  FileSpreadsheet
} from 'lucide-react';

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
    if (!reporte) return;
    const hoja = [
      ['Estadística', 'Valor'],
      ['Total Reservas', reporte.stats.totalReservas],
      ['Total Validados', reporte.stats.totalValidados],
      ['Total Pendientes', reporte.stats.totalPendientes],
      ['Porcentaje Validación', `${reporte.stats.porcentajeValidacion}%`],
      // ...agrega más si quieres
    ];
    const ws = XLSX.utils.aoa_to_sheet(hoja);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resumen');
    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'reporte.xlsx');
  };

  const exportarPDF = () => {
    if (!reporte) return;
    const doc = new jsPDF();
    doc.text('Reporte del Evento', 10, 10);
    doc.text(`Total reservas: ${reporte.stats.totalReservas}`, 10, 20);
    doc.text(`Validados: ${reporte.stats.totalValidados}`, 10, 30);
    doc.text(`Pendientes: ${reporte.stats.totalPendientes}`, 10, 40);
    doc.text(`% Validación: ${reporte.stats.porcentajeValidacion}%`, 10, 50);
    // Puedes agregar tablas o más info si quieres
    doc.save('reporte.pdf');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="text-blue-500" size={32} />
            Reportes y Estadísticas
          </h1>
          <p className="text-gray-400 mt-1">Análisis detallado del evento seleccionado</p>
        </div>
      </div>

      {/* Selector de evento */}
      <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-purple-500" />
          Seleccionar Evento
        </h2>
        <EventoSelector />
      </div>

      {reporte ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Resumen general */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -mr-12 -mt-12 transition-all group-hover:bg-blue-500/20"></div>
              <p className="text-gray-400 text-sm font-medium mb-2">Total Reservas</p>
              <p className="text-4xl font-bold text-white">{reporte.stats.totalReservas}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-400">
                <Users size={16} />
                <span>Asistentes esperados</span>
              </div>
            </div>

            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-green-500/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-xl -mr-12 -mt-12 transition-all group-hover:bg-green-500/20"></div>
              <p className="text-gray-400 text-sm font-medium mb-2">Validados</p>
              <p className="text-4xl font-bold text-white">{reporte.stats.totalValidados}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
                <CheckCircle size={16} />
                <span>Ya ingresaron</span>
              </div>
            </div>

            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-yellow-500/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl -mr-12 -mt-12 transition-all group-hover:bg-yellow-500/20"></div>
              <p className="text-gray-400 text-sm font-medium mb-2">Pendientes</p>
              <p className="text-4xl font-bold text-white">{reporte.stats.totalPendientes}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-yellow-400">
                <Clock size={16} />
                <span>Por ingresar</span>
              </div>
            </div>

            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl -mr-12 -mt-12 transition-all group-hover:bg-purple-500/20"></div>
              <p className="text-gray-400 text-sm font-medium mb-2">Tasa de Validación</p>
              <p className="text-4xl font-bold text-white">{reporte.stats.porcentajeValidacion}%</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${reporte.stats.porcentajeValidacion}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Validaciones por hora */}
            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="text-blue-500" size={24} />
                Ingresos por Hora
              </h2>
              {reporte.validacionesPorHora.length > 0 ? (
                <div className="space-y-4">
                  {reporte.validacionesPorHora.map((item, index) => (
                    <div key={index} className="group">
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="text-gray-400 font-mono">{item.hora}</span>
                        <span className="text-white font-medium">{item.cantidad} personas</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-1000 group-hover:from-blue-500 group-hover:to-blue-300"
                          style={{
                            width: `${Math.min((item.cantidad / Math.max(...reporte.validacionesPorHora.map(v => v.cantidad))) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                  <p className="text-gray-400">No hay validaciones registradas aún</p>
                </div>
              )}
            </div>

            {/* Información del evento */}
            {eventoActual && (
              <div className="bg-[#1a1a1a]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Info className="text-purple-500" size={24} />
                  Detalles del Evento
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Evento</p>
                      <p className="text-white font-bold text-lg">{eventoActual.nombre}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(eventoActual.fecha_inicio).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <MapPin size={16} />
                        <span className="text-xs uppercase tracking-wider">Ubicación</span>
                      </div>
                      <p className="text-white font-medium">{eventoActual.ubicacion}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <Users size={16} />
                        <span className="text-xs uppercase tracking-wider">Aforo</span>
                      </div>
                      <p className="text-white font-medium">{eventoActual.aforo_max} personas</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Entradas por tipo */}
          {reporte.tiposEntrada.length > 0 && (
            <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-2xl overflow-hidden">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Ticket className="text-green-500" size={24} />
                Desglose por Tipo de Entrada
              </h2>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-4 text-left text-gray-400 text-sm font-medium uppercase tracking-wider">Tipo</th>
                      <th className="px-4 py-4 text-left text-gray-400 text-sm font-medium uppercase tracking-wider">Vendidas</th>
                      <th className="px-4 py-4 text-left text-gray-400 text-sm font-medium uppercase tracking-wider">Validadas</th>
                      <th className="px-4 py-4 text-left text-gray-400 text-sm font-medium uppercase tracking-wider">Porcentaje</th>
                      <th className="px-4 py-4 text-left text-gray-400 text-sm font-medium uppercase tracking-wider w-1/3">Progreso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reporte.tiposEntrada.map((entrada, index) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 text-white font-medium">{entrada.tipo}</td>
                        <td className="px-4 py-4 text-gray-300">{entrada.vendidas}</td>
                        <td className="px-4 py-4 text-green-400 font-bold">{entrada.validadas}</td>
                        <td className="px-4 py-4 text-white">{entrada.porcentaje.toFixed(1)}%</td>
                        <td className="px-4 py-4">
                          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
                              style={{ width: `${entrada.porcentaje}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {reporte.tiposEntrada.map((entrada, index) => (
                  <div key={index} className="bg-white/5 p-4 border-b border-white/5 last:border-0">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white font-bold">{entrada.tipo}</span>
                      <span className="text-green-400 font-bold text-sm">{entrada.porcentaje.toFixed(1)}%</span>
                    </div>

                    <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${entrada.porcentaje}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-black/20 p-2 rounded-lg text-center">
                        <span className="text-gray-500 text-xs block mb-1">Vendidas</span>
                        <span className="text-white font-medium">{entrada.vendidas}</span>
                      </div>
                      <div className="bg-black/20 p-2 rounded-lg text-center">
                        <span className="text-gray-500 text-xs block mb-1">Validadas</span>
                        <span className="text-green-400 font-medium">{entrada.validadas}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={exportarExcel}
              className="flex-1 py-4 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <FileSpreadsheet size={20} />
              Exportar a Excel
            </button>
            <button
              onClick={exportarPDF}
              className="flex-1 py-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              Exportar a PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-[#1a1a1a]/40 border border-white/5 rounded-3xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Sin datos para mostrar</h3>
          <p className="text-gray-400">Selecciona un evento arriba para ver sus estadísticas y reportes.</p>
        </div>
      )}
    </div>
  );
}
