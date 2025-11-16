'use client';
import { useEffect, useState } from 'react';

export default function NotificacionesPage() {

  interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
}

const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    fetch(`/api/notificaciones?usuario_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setNotificaciones(data.notificaciones);
      })
      .finally(() => setLoading(false));
  }, []);


  
  const marcarTodasComoLeidas = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    await fetch('/api/notificaciones', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: user.id }),
    });
    setNotificaciones(prev =>
      prev.map((n: any) => ({ ...n, leida: true }))
    );
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'recordatorio': return '⏰';
      case 'confirmacion': return '✅';
      case 'cancelacion': return '❌';
      case 'reembolso': return '💰';
      default: return '📢';
    }
  };

  if (loading) return <div className="text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Notificaciones</h1>
        <button
          className="text-blue-400 hover:text-blue-300 text-sm"
          onClick={marcarTodasComoLeidas}
        >
          Marcar todas como leídas
        </button>
      </div>
      <div className="space-y-3">
        {notificaciones.map((notif: any) => (
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
                  <h3 className="text-white font-medium">{notif.titulo || notif.tipo}</h3>
                  <span className="text-gray-400 text-xs">
                    {new Date(notif.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mt-1">{notif.mensaje}</p>
              </div>
              {!notif.leida && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
