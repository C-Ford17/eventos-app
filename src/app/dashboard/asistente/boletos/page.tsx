// src/app/dashboard/asistente/boletos/page.tsx
'use client';

export default function BoletosPage() {
  const boletos = [
    {
      id: 1,
      evento: 'Tech Summit 2024',
      fecha: '2024-11-01',
      lugar: 'Centro de Convenciones',
      codigo: 'TS2024-001-AB12',
      tipo: 'General',
    },
    {
      id: 2,
      evento: 'Festival de Música Electrónica',
      fecha: '2024-11-15',
      lugar: 'Gran Parque Urbano',
      codigo: 'FME2024-045-XY89',
      tipo: 'VIP',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Mis Boletos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {boletos.map((boleto) => (
          <div
            key={boleto.id}
            className="bg-neutral-800 rounded-lg p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {boleto.evento}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {new Date(boleto.fecha).toLocaleDateString('es-ES')}
                </p>
                <p className="text-gray-400 text-sm">{boleto.lugar}</p>
              </div>
              <span className="bg-blue-600 px-3 py-1 rounded text-xs text-white">
                {boleto.tipo}
              </span>
            </div>

            <div className="bg-white p-4 rounded flex items-center justify-center">
              {/* Aquí irá el código QR - por ahora solo texto */}
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">QR Code</span>
                </div>
                <p className="text-gray-800 text-sm font-mono">
                  {boleto.codigo}
                </p>
              </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition">
              Descargar Boleto
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
