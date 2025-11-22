'use client';
import { useEffect, useState } from 'react';
import { Briefcase, Search, DollarSign, Tag, User, Ban, CheckCircle } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';

export default function AdminServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/admin/services');
            const data = await res.json();
            if (data.success) {
                setServices(data.services);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleServiceAction = async (serviceId: string, action: 'block' | 'unblock') => {
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            const res = await fetch('/api/admin/services', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || 'admin'
                },
                body: JSON.stringify({ serviceId, action }),
            });
            const data = await res.json();
            if (data.success) {
                fetchServices(); // Refresh the list
            }
        } catch (error) {
            console.error('Error updating service:', error);
        }
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = service.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || service.categoria === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryBadge = (category: string) => {
        const colors: any = {
            'Catering': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            'Audio': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'Iluminación': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            'Fotografía': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            'Video': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
            'Decoración': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            'Seguridad': 'bg-red-500/10 text-red-400 border-red-500/20',
            'Transporte': 'bg-green-500/10 text-green-400 border-green-500/20',
            'Animación': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            'Tecnología': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            'Mobiliario': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'Otro': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        };
        return colors[category] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Gestión de Servicios</h1>
                <p className="text-gray-400">Administra todos los servicios de proveedores</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar servicios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="w-full md:w-64">
                    <CustomDropdown
                        options={[
                            { value: 'all', label: 'Todas las categorías' },
                            { value: 'Catering', label: 'Catering' },
                            { value: 'Audio', label: 'Audio' },
                            { value: 'Iluminación', label: 'Iluminación' },
                            { value: 'Fotografía', label: 'Fotografía' },
                            { value: 'Video', label: 'Video' },
                            { value: 'Decoración', label: 'Decoración' },
                            { value: 'Seguridad', label: 'Seguridad' },
                            { value: 'Transporte', label: 'Transporte' },
                            { value: 'Animación', label: 'Animación' },
                            { value: 'Tecnología', label: 'Tecnología' },
                            { value: 'Mobiliario', label: 'Mobiliario' },
                            { value: 'Otro', label: 'Otro' },
                        ]}
                        value={filterCategory}
                        onChange={setFilterCategory}
                        placeholder="Filtrar por categoría"
                    />
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        Cargando servicios...
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        No se encontraron servicios
                    </div>
                ) : (
                    filteredServices.map((service) => (
                        <div
                            key={service.id}
                            className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                        >
                            {service.imagen_url && (
                                <img
                                    src={service.imagen_url}
                                    alt={service.nombre}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-6 space-y-4">
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-white">{service.nombre}</h3>
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryBadge(service.categoria)}`}>
                                                {service.categoria}
                                            </span>
                                            {service.bloqueado && (
                                                <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full border border-red-500/20">
                                                    Bloqueado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm line-clamp-2">{service.descripcion}</p>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <User size={16} />
                                        <span>{service.proveedor?.nombre || 'Proveedor'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <DollarSign size={16} />
                                        <span>${service.precio_base ? Number(service.precio_base).toLocaleString() : 'N/A'}</span>
                                    </div>
                                    {service.disponibilidad && (
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">
                                                Disponible
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                    <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                                        Ver Detalles
                                    </button>
                                    {service.bloqueado ? (
                                        <button
                                            onClick={() => handleServiceAction(service.id, 'unblock')}
                                            className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                            title="Desbloquear servicio"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleServiceAction(service.id, 'block')}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Bloquear servicio"
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
                    <p className="text-gray-400 text-sm">Total Servicios</p>
                    <p className="text-2xl font-bold text-white mt-1">{services.length}</p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Disponibles</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {services.filter(s => s.disponibilidad).length}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Categorías</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {new Set(services.map(s => s.categoria)).size}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Proveedores</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {new Set(services.map(s => s.proveedor_id)).size}
                    </p>
                </div>
            </div>
        </div>
    );
}
