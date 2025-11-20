'use client';
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export default function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [show, setShow] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`/api/notifications?userId=${userId}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notificaciones);
                setUnreadCount(data.noLeidas);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (!userId) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [userId]);

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, { method: 'PUT' });
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, leida: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n.id !== id));
            // If it was unread, decrease count
            const wasUnread = notifications.find(n => n.id === id)?.leida === false;
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShow(!show)}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-[#0a0a0a]">
                        {unreadCount}
                    </span>
                )}
            </button>

            {show && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none z-40"
                        onClick={() => setShow(false)}
                    />

                    {/* Dropdown/Bottom Sheet */}
                    <div className={`
                        fixed md:absolute
                        bottom-0 md:bottom-auto md:top-full md:mt-2
                        left-0 md:left-auto
                        right-0 md:right-0
                        w-full md:w-80
                        max-h-[70vh] md:max-h-[400px]
                        bg-[#1a1a1a] border border-white/10
                        rounded-t-2xl md:rounded-xl
                        shadow-2xl z-50
                        transition-all duration-200
                        ${show ? 'translate-y-0 opacity-100' : 'translate-y-full md:translate-y-0 opacity-0'}
                        overflow-hidden flex flex-col
                    `}>
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a] shrink-0">
                            <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
                            <button
                                onClick={fetchNotifications}
                                className="text-xs text-blue-400 hover:text-blue-300"
                            >
                                Actualizar
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    No tienes notificaciones
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 hover:bg-white/5 transition-colors relative group ${!notif.leida ? 'bg-blue-500/5' : ''}`}
                                            onClick={() => !notif.leida && markAsRead(notif.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.leida ? 'bg-blue-500' : 'bg-transparent'}`} />
                                                <div className="flex-1">
                                                    <p className={`text-sm ${!notif.leida ? 'text-white font-medium' : 'text-gray-400'}`}>
                                                        {notif.mensaje}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => deleteNotification(notif.id, e)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                                                    title="Eliminar"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
