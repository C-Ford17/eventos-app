'use client';
import { useEffect, useState } from 'react';
import { Calendar, Search, MapPin, Users, DollarSign, Ban, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import CustomDropdown from '@/components/CustomDropdown';

export default function AdminEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/admin/events');
            const data = await res.json();
            if (data.success) {
                setEvents(data.events);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEventAction = async (eventId: string, action: 'block' | 'unblock') => {
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            const res = await fetch('/api/admin/events', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || 'admin'
                },
                body: JSON.stringify({ eventId, action }),
            });
            const data = await res.json();
            if (data.success) {
                fetchEvents(); // Refresh the list
            }
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || event.estado === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const colors: any = {
            programado: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            en_curso: 'bg-green-500/10 text-green-400 border-green-500/20',
            finalizado: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
            cancelado: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return colors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Gestión de Eventos</h1>
                <p className="text-gray-400">Administra todos los eventos de la plataforma</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar eventos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="w-full md:w-64">
                    <CustomDropdown
                        options={[
                            { value: 'all', label: 'Todos los estados' },
                            { value: 'programado', label: 'Programado' },
                            { value: 'en_curso', label: 'En Curso' },
                            { value: 'finalizado', label: 'Finalizado' },
                            { value: 'cancelado', label: 'Cancelado' },
                        ]}
                        value={filterStatus}
                        onChange={setFilterStatus}
                        placeholder="Filtrar por estado"
                    />
                </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        Cargando eventos...
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        No se encontraron eventos
                    </div>
                ) : (
                    filteredEvents.map((event) => (
                        <div
                            key={event.id}
                            className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                        >
                            {event.imagen_url && (
                                <img
                                    src={event.imagen_url}
                                    alt={event.nombre}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-6 space-y-4">
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-white">{event.nombre}</h3>
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(event.estado)}`}>
                                                {event.estado}
                                            </span>
                                            {event.bloqueado && (
                                                <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full border border-red-500/20">
                                                    Bloqueado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm line-clamp-2">{event.descripcion}</p>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar size={16} />
                                        <span>{new Date(event.fecha_inicio).toLocaleDateString('es-ES')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <MapPin size={16} />
                                        <span className="truncate">{event.ubicacion}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Users size={16} />
                                        <span>Cap: {event.aforo_max || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                    <Link
                                        href={`/eventos/${event.id}`}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-center text-sm font-medium transition-colors"
                                    >
                                        Ver Detalles
                                    </Link>
                                    {event.bloqueado ? (
                                        <button
                                            onClick={() => handleEventAction(event.id, 'unblock')}
                                            className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                            title="Desbloquear evento"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleEventAction(event.id, 'block')}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Bloquear evento"
                                        >
                                            <Ban size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Total Eventos</p>
                    <p className="text-2xl font-bold text-white mt-1">{events.length}</p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Programados</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {events.filter(e => e.estado === 'programado').length}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">En Curso</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {events.filter(e => e.estado === 'en_curso').length}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Finalizados</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {events.filter(e => e.estado === 'finalizado').length}
                    </p>
                </div>
            </div>
        </div>
    );
}
