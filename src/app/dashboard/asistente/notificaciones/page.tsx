// src/app/dashboard/asistente/notificaciones/page.tsx
'use client';

export default function NotificacionesPage() {
  const notificaciones = [
    {
      id: 1,
      tipo: 'recordatorio',
      titulo: 'Recordatorio: Tech Summit 2024',
      mensaje: 'Tu evento comienza en 3 días. No olvides tu boleto.',
      fecha: '2024-10-29',
      leida: false,
    },
    {
      id: 2,
      tipo: 'confirmacion',
      titulo: 'Reserva confirmada',
      mensaje: 'Tu reserva para Festival de Música Electrónica ha sido confirmada.',
      fecha: '2024-10-25',
      leida: true,
    },
    {
      id: 3,
      tipo: 'cancelacion',
      titulo: 'Evento cancelado',
      mensaje: 'El evento "Concierto de Rock" ha sido cancelado. Se procesará tu reembolso.',
      fecha: '2024-10-20',
      leida: false,
    },
    {
      id: 4,
      tipo: 'reembolso',
      titulo: 'Reembolso procesado',
      mensaje: 'Tu reembolso de $50,000 ha sido procesado exitosamente.',
      fecha: '2024-10-18',
      leida: true,
    },
  ];

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'recordatorio':
        return '⏰';
      case 'confirmacion':
        return '✅';
      case 'cancelacion':
        return '❌';
      case 'reembolso':
        return '💰';
      default:
        return '📢';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Notificaciones</h1>
        <button className="text-blue-400 hover:text-blue-300 text-sm">
          Marcar todas como leídas
        </button>
      </div>

      <div className="space-y-3">
        {notificaciones.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-lg ${
              notif.leida ? 'bg-neutral-800' : 'bg-neutral-700'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{getTipoIcon(notif.tipo)}</span>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-white font-medium">{notif.titulo}</h3>
                  <span className="text-gray-400 text-xs">
                    {new Date(notif.fecha).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mt-1">{notif.mensaje}</p>
              </div>
              {!notif.leida && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
