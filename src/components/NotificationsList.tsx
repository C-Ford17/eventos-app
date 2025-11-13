// src/components/NotificationList.tsx
interface Notification {
  titulo: string;
  mensaje: string;
  fecha: string;
}

interface NotificationListProps {
  items: Notification[];
}

export default function NotificationList({ items }: NotificationListProps) {
  return (
    <ul className="bg-white rounded shadow p-4 divide-y">
      {items.length > 0 ? (
        items.map((noti, idx) => (
          <li key={idx} className="py-2 text-sm">
            <span className="font-semibold">{noti.titulo}:</span> {noti.mensaje}
            <span className="ml-2 text-xs text-gray-400">{noti.fecha}</span>
          </li>
        ))
      ) : (
        <li className="py-2 text-gray-400">Sin notificaciones</li>
      )}
    </ul>
  );
}
