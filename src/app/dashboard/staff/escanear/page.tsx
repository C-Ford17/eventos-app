// src/app/dashboard/staff/escanear/page.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import jsQR from 'jsqr';
import { Camera, Upload, Search, CheckCircle, XCircle, QrCode, AlertCircle } from 'lucide-react';
import { useStaff } from '@/contexts/StaffContext';

// Importa el escáner de forma dinámica para evitar problemas de SSR
const QRScanner = dynamic(() => import('@/components/QRScanner'), {
  ssr: false,
});

interface ActividadReciente {
  nombre: string;
  hora: string;
  estado: 'exitoso' | 'error';
  codigo: string;
  mensaje?: string;
}



export default function EscanearEntradasPage() {
  const { eventoSeleccionado, eventoActual } = useStaff();
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [codigoManual, setCodigoManual] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [validando, setValidando] = useState(false);
  const [actividadReciente, setActividadReciente] = useState<ActividadReciente[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statsEvento, setStatsEvento] = useState({
    asistentesValidados: 0,
    totalReservas: 0,
    aforoMax: 0,
  });

  // ✅ Cargar estadísticas del evento seleccionado
  const cargarStatsEvento = async (eventoId: string) => {
    try {
      const response = await fetch(`/api/eventos/${eventoId}/stats`);
      const data = await response.json();

      if (data.success) {
        setStatsEvento({
          asistentesValidados: data.stats.asistentesValidados || 0,
          totalReservas: data.stats.totalReservas || 0,
          aforoMax: data.stats.aforoMax || 0,
        });
      }
    } catch (error) {
      console.error('Error cargando stats:', error);
    }
  };

  // ✅ Cuando cambia el evento seleccionado
  useEffect(() => {
    if (eventoSeleccionado) {
      cargarStatsEvento(eventoSeleccionado);
    }
  }, [eventoSeleccionado]);

  const handleActivarCamara = () => {
    setCamaraActiva(!camaraActiva);
  };

  const validarQR = async (qrData: string) => {
    setValidando(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Enviar qrData como UUID directamente al backend para validar
      const response = await fetch('/api/validar-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrData,         // QR esperado como UUID string
          staff_id: user.id,
          evento_id: eventoSeleccionado,
        }),
      });


      const result = await response.json();

      if (response.ok && result.success) {
        // Validación exitosa
        const nuevaActividad: ActividadReciente = {
          nombre: result.data.asistente || 'Entrada validada',
          hora: new Date().toLocaleTimeString('es-ES'),
          estado: 'exitoso',
          codigo: result.data.reservaId,
          mensaje: result.message,
        };
        setActividadReciente([nuevaActividad, ...actividadReciente]);
        // ✅ Actualizar stats
        cargarStatsEvento(eventoSeleccionado);
        showNotification(`✓ ${result.message}`, 'success');
      } else {
        // Error de validación
        const nuevaActividad: ActividadReciente = {
          nombre: result.tipo === 'duplicado' ? 'Entrada Duplicada' : 'Código Inválido',
          hora: new Date().toLocaleTimeString('es-ES'),
          estado: 'error',
          codigo: 'N/A',
          mensaje: result.error,
        };
        setActividadReciente([nuevaActividad, ...actividadReciente]);

        showNotification(`✗ ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error validando QR:', error);
      showNotification('Error de conexión', 'error');
    } finally {
      setValidando(false);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    console.log('📱 QR detectado desde cámara:', decodedText);

    if (!validando) {
      validarQR(decodedText);
    }
  };

  const handleScanError = (error: string) => {
    console.error('❌ Error del escáner:', error);
    // showNotification('Error con la cámara: ' + error, 'error'); // Too noisy
  };

  const handleValidarManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoManual.trim()) {
      showNotification('Ingresa un código válido', 'error');
      return;
    }
    // Ya no intentas parsear JSON, aceptas string plano
    validarQR(codigoManual.trim());
    setCodigoManual('');
  };

  // ✅ NUEVA FUNCIÓN: Subir imagen
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📸 Procesando imagen:', file.name);

    try {
      // Leer imagen
      const imageDataUrl = await readFileAsDataURL(file);

      // Crear elemento de imagen
      const img = new Image();
      img.src = imageDataUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Crear canvas para procesar
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No se pudo crear contexto de canvas');
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Obtener datos de la imagen
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Buscar código QR
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        console.log('✅ QR detectado en imagen:', code.data);
        validarQR(code.data);
      } else {
        showNotification('❌ No se detectó ningún código QR en la imagen', 'error');
      }
    } catch (error) {
      console.error('❌ Error procesando imagen:', error);
      showNotification('Error al procesar la imagen', 'error');
    }

    // Resetear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    // Implementa una notificación toast o alert
    // Por ahora usamos alert simple
    alert(message);
  };


  return (
    <div className="space-y-8 pb-10">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visor de cámara */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Camera size={20} className="text-blue-400" />
                Visor de Cámara
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition border border-white/5"
                >
                  <Upload size={16} />
                  <span className="hidden sm:inline">Subir Imagen</span>
                  <span className="sm:hidden">Subir</span>
                </button>
                <button
                  onClick={handleActivarCamara}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${camaraActiva
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                    }`}
                >
                  <Camera size={16} />
                  {camaraActiva ? 'Detener' : 'Activar Cámara'}
                </button>
              </div>
            </div>

            {/* Input oculto para subir imagen */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Área de cámara */}
            <div className="mb-6">
              {!camaraActiva ? (
                <div className="relative bg-black/40 rounded-2xl border-2 border-dashed border-white/10 aspect-video flex items-center justify-center group hover:border-blue-500/30 transition-colors">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Camera className="w-8 h-8 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <p className="text-gray-400 max-w-xs mx-auto">
                      La cámara está desactivada. Haz clic en "Activar Cámara" para iniciar el escaneo.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <QRScanner
                    isActive={camaraActiva}
                    onScanSuccess={handleScanSuccess}
                    onScanError={handleScanError}
                  />
                </div>
              )}
            </div>

            {validando && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-xl mb-6 flex items-center justify-center gap-3 animate-pulse">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Validando entrada...
              </div>
            )}

            {/* Entrada manual de código */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <QrCode size={18} className="text-gray-400" />
                Validación Manual
              </h3>
              <form onSubmit={handleValidarManual} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={codigoManual}
                  onChange={(e) => setCodigoManual(e.target.value)}
                  placeholder="Pega o escribe el código del QR"
                  disabled={validando}
                  className="flex-1 px-4 py-3 bg-black/20 text-white rounded-xl border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-all"
                />
                <button
                  type="submit"
                  disabled={validando}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition disabled:opacity-50 shadow-lg shadow-blue-600/20 whitespace-nowrap"
                >
                  Validar
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Panel lateral con stats reales */}
        <div className="lg:col-span-1 space-y-6">
          {/* ✅ Asistencia en vivo CON DATOS REALES */}
          <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              Asistencia en Vivo
            </h3>
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Asistentes validados</span>
                <span className="text-white font-bold">
                  {statsEvento.asistentesValidados} <span className="text-gray-500 font-normal">/ {statsEvento.aforoMax}</span>
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${statsEvento.aforoMax > 0 ? (statsEvento.asistentesValidados / statsEvento.aforoMax) * 100 : 0}%`
                  }}
                ></div>
              </div>
              <div className="mt-3 flex justify-between text-xs">
                <span className="text-gray-500">Total reservas: {statsEvento.totalReservas}</span>
                <span className="text-blue-400 font-medium">
                  {statsEvento.aforoMax > 0 ? ((statsEvento.asistentesValidados / statsEvento.aforoMax) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar asistente..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 text-white rounded-xl border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
              />
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-[#1a1a1a]/60 border border-white/10 p-6 rounded-3xl flex-1">
            <h3 className="text-lg font-bold text-white mb-4">Actividad Reciente</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {actividadReciente.length === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-xl border border-white/5 border-dashed">
                  <p className="text-gray-400 text-sm">No hay actividad reciente</p>
                </div>
              ) : (
                actividadReciente.map((actividad, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors"
                  >
                    {actividad.estado === 'exitoso' ? (
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-green-400 border border-green-500/20">
                        <CheckCircle size={16} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-red-400 border border-red-500/20">
                        <XCircle size={16} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${actividad.estado === 'exitoso' ? 'text-green-400' : 'text-red-400'}`}>
                        {actividad.nombre}
                      </p>
                      <p className="text-gray-500 text-xs">{actividad.hora}</p>
                      {actividad.mensaje && (
                        <p className="text-gray-400 text-xs mt-1 bg-black/20 p-1.5 rounded border border-white/5 break-words">
                          {actividad.mensaje}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
