// src/app/dashboard/staff/escanear/page.tsx
'use client';
import { useState } from 'react';

export default function EscanearEntradasPage() {
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [codigoManual, setCodigoManual] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Datos del evento actual
  const eventoActual = {
    nombre: 'Evento Anual 2024',
    asistentesRegistrados: 678,
    aforoTotal: 1500,
  };

  // Actividad reciente
  const actividadReciente = [
    { nombre: 'Alejandro Vargas', hora: '14:32:15', estado: 'exitoso', codigo: 'QR-1234567' },
    { nombre: 'Entrada Duplicada', hora: '14:31:59', estado: 'error', codigo: 'QR-7654321' },
    { nombre: 'Mariana Fuentes', hora: '14:31:40', estado: 'exitoso', codigo: 'QR-9876543' },
    { nombre: 'Javier Torres', hora: '14:30:11', estado: 'exitoso', codigo: 'QR-1111222' },
  ];

  const handleActivarCamara = () => {
    setCamaraActiva(!camaraActiva);
    // Aquí iría la lógica real para activar la cámara
    // Usando navigator.mediaDevices.getUserMedia() o una librería como react-qr-reader
  };

  const handleValidarManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoManual.trim()) {
      alert('Ingresa un código válido');
      return;
    }
    // Simular validación
    alert(`Validando código: ${codigoManual}`);
    setCodigoManual('');
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
              <h2 className="text-xl font-semibold text-white mb-4">Visor de Cámara</h2>

              {/* Área de cámara */}
              <div className="relative bg-neutral-900 rounded-lg border-4 border-dashed border-neutral-700 aspect-video flex items-center justify-center mb-6">
                {!camaraActiva ? (
                  <div className="text-center p-8">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-400 mb-4">
                      La cámara está desactivada. Haz clic en el botón para iniciar el escaneo.
                    </p>
                    <button
                      onClick={handleActivarCamara}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition inline-flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Activar Cámara
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-64 h-64 bg-neutral-800 mx-auto mb-4 rounded flex items-center justify-center">
                        <p className="text-gray-500">
                          Vista de cámara activa
                          <br />
                          (Se integrará con navigator.mediaDevices)
                        </p>
                      </div>
                      <button
                        onClick={handleActivarCamara}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                      >
                        Detener Cámara
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Entrada manual de código */}
              <div className="bg-neutral-900 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3">Validación Manual</h3>
                <form onSubmit={handleValidarManual} className="flex space-x-3">
                  <input
                    type="text"
                    value={codigoManual}
                    onChange={(e) => setCodigoManual(e.target.value)}
                    placeholder="Ingresa el código QR manualmente"
                    className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
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
                    className="bg-blue-600 h-3 rounded-full"
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
                  placeholder="Buscar por nombre, email o código"
                  className="w-full px-4 py-3 bg-neutral-900 text-white rounded border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Actividad reciente */}
            <div className="bg-neutral-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {actividadReciente.map((actividad, index) => (
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
                      <p className="text-white font-medium truncate">{actividad.nombre}</p>
                      <p className="text-gray-400 text-xs">{actividad.hora}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
