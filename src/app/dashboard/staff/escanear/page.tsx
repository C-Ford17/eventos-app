// src/app/dashboard/staff/escanear/page.tsx
'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

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
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [codigoManual, setCodigoManual] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [validando, setValidando] = useState(false);
  const [actividadReciente, setActividadReciente] = useState<ActividadReciente[]>([]);

  // Datos del evento actual
  const eventoActual = {
    nombre: 'Evento Anual 2024',
    asistentesRegistrados: 678,
    aforoTotal: 1500,
  };

  const handleActivarCamara = () => {
    setCamaraActiva(!camaraActiva);
  };

  const validarQR = async (qrData: string) => {
  setValidando(true);
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const response = await fetch('/api/validar-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        qrData,
        staff_id: user.id // Envía el ID del staff para auditoría
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
    if (!validando) {
      validarQR(decodedText);
    }
  };

  const handleScanError = (error: string) => {
    console.error('Error del escáner:', error);
  };

  const handleValidarManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoManual.trim()) {
      alert('Ingresa un código válido');
      return;
    }
    validarQR(codigoManual);
    setCodigoManual('');
  };

  const playSuccessSound = () => {
    // Opcional: reproduce un sonido de éxito
    const audio = new Audio('/sounds/success.mp3');
    audio.play().catch(() => {});
  };

  const playErrorSound = () => {
    // Opcional: reproduce un sonido de error
    const audio = new Audio('/sounds/error.mp3');
    audio.play().catch(() => {});
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    // Implementa una notificación toast o alert
    // Por ahora usamos alert simple
    alert(message);
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Control de Acceso</h1>
          <p className="text-gray-400">
            Presenta el código QR a la cámara para validarlo.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Control de Acceso: {eventoActual.nombre}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visor de cámara */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-800 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Visor de Cámara</h2>
                <button
                  onClick={handleActivarCamara}
                  className={`px-4 py-2 rounded font-semibold transition ${
                    camaraActiva
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {camaraActiva ? 'Detener Cámara' : 'Activar Cámara'}
                </button>
              </div>

              {/* Área de cámara */}
              <div className="mb-6">
                {!camaraActiva ? (
                  <div className="relative bg-neutral-900 rounded-lg border-4 border-dashed border-neutral-700 aspect-video flex items-center justify-center">
                    <div className="text-center p-8">
                      <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-400">
                        La cámara está desactivada. Haz clic en "Activar Cámara" para iniciar el escaneo.
                      </p>
                    </div>
                  </div>
                ) : (
                  <QRScanner
                    isActive={camaraActiva}
                    onScanSuccess={handleScanSuccess}
                    onScanError={handleScanError}
                  />
                )}
              </div>

              {validando && (
                <div className="bg-blue-900/50 border border-blue-700 text-blue-200 px-4 py-3 rounded mb-4 flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validando entrada...
                </div>
              )}

              {/* Entrada manual de código */}
              <div className="bg-neutral-900 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3">Validación Manual</h3>
                <form onSubmit={handleValidarManual} className="flex space-x-3">
                  <input
                    type="text"
                    value={codigoManual}
                    onChange={(e) => setCodigoManual(e.target.value)}
                    placeholder="Pega o escribe el código del QR"
                    disabled={validando}
                    className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={validando}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition disabled:opacity-50"
                  >
                    Validar
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="lg:col-span-1 space-y-6">
            {/* Asistencia en vivo */}
            <div className="bg-neutral-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Asistencia en Vivo</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Asistentes registrados</span>
                  <span className="text-white font-semibold">
                    {eventoActual.asistentesRegistrados} / {eventoActual.aforoTotal}
                  </span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${(eventoActual.asistentesRegistrados / eventoActual.aforoTotal) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Búsqueda rápida */}
              <div>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar asistente..."
                  className="w-full px-4 py-3 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Actividad reciente */}
            <div className="bg-neutral-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {actividadReciente.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">
                    No hay actividad reciente
                  </p>
                ) : (
                  actividadReciente.map((actividad, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-neutral-900 rounded"
                    >
                      {actividad.estado === 'exitoso' ? (
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${actividad.estado === 'exitoso' ? 'text-green-400' : 'text-red-400'}`}>
                          {actividad.nombre}
                        </p>
                        <p className="text-gray-400 text-xs">{actividad.hora}</p>
                        {actividad.mensaje && (
                          <p className="text-gray-500 text-xs mt-1">{actividad.mensaje}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
