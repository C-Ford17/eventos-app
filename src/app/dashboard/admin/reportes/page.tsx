'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, Search, CheckCircle, XCircle, Clock, Eye, Flag, Filter } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';

export default function AdminReportsPage() {
    const [reportes, setReportes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroPrioridad, setFiltroPrioridad] = useState('todos');
    const [modalReporte, setModalReporte] = useState<any>(null);

    useEffect(() => {
        cargarReportes();
    }, [filtroTipo, filtroEstado, filtroPrioridad]);

    const cargarReportes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filtroTipo !== 'todos') params.append('tipo', filtroTipo);
            if (filtroEstado !== 'todos') params.append('estado', filtroEstado);
            if (filtroPrioridad !== 'todos') params.append('prioridad', filtroPrioridad);

            const response = await fetch(`/api/admin/reportes?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setReportes(data.reportes);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccion = async (reporteId: string, action: string) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        let respuesta_admin = '';
        if (action === 'resolve' || action === 'reject') {
            respuesta_admin = prompt(`Agrega una respuesta para el reportante (opcional):`) || '';
        }

        try {
            const response = await fetch('/api/admin/reportes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reporteId,
                    action,
                    admin_id: user.id,
                    respuesta_admin: respuesta_admin || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert(`✅ ${data.message}`);
                cargarReportes();
            } else {
                alert('❌ Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar reporte');
        }
    };

    const reportesFiltrados = reportes.filter(r => {
        const matchBusqueda =
            r.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
            r.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
            r.reportante.nombre.toLowerCase().includes(busqueda.toLowerCase());
        return matchBusqueda;
    });

    const getStatusBadge = (estado: string) => {
        const colors: any = {
            pendiente: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            en_revision: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            resuelto: 'bg-green-500/10 text-green-400 border-green-500/20',
            rechazado: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return colors[estado] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    const getStatusIcon = (estado: string) => {
        switch (estado) {
            case 'pendiente':
                return <Clock size={16} />;
            case 'en_revision':
                return <Eye size={16} />;
            case 'resuelto':
                return <CheckCircle size={16} />;
            case 'rechazado':
                return <XCircle size={16} />;
            default:
                return <AlertTriangle size={16} />;
        }
    };

    const getPrioridadBadge = (prioridad: string) => {
        const colors: any = {
            baja: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
            media: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            alta: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            critica: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return colors[prioridad] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    const getTipoLabel = (tipo: string) => {
        const labels: any = {
            evento: 'Evento',
            servicio: 'Servicio',
            usuario: 'Usuario',
            bug: 'Bug/Problema',
        };
        return labels[tipo] || tipo;
    };

    const getEntidadNombre = (reporte: any) => {
        if (reporte.evento) return reporte.evento.nombre;
        if (reporte.servicio) return reporte.servicio.nombre;
        if (reporte.usuario_reportado) return reporte.usuario_reportado.nombre;
        return 'N/A';
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Flag className="text-red-500" size={32} />
                    Reportes
                </h1>
                <p className="text-gray-400 mt-1">Gestiona reportes de usuarios, eventos, servicios y problemas técnicos</p>
            </div>

            {/* Filtros */}
            <div className="bg-[#1a1a1a] border border-white/10 p-4 rounded-2xl space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar reportes..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <CustomDropdown
                            options={[
                                { value: 'todos', label: 'Todos los tipos' },
                                { value: 'evento', label: 'Eventos' },
                                { value: 'servicio', label: 'Servicios' },
                                { value: 'usuario', label: 'Usuarios' },
                                { value: 'bug', label: 'Bugs/Problemas' },
                            ]}
                            value={filtroTipo}
                            onChange={setFiltroTipo}
                            buttonClassName="pl-12"
                        />
                    </div>

                    <CustomDropdown
                        options={[
                            { value: 'todos', label: 'Todos los estados' },
                            { value: 'pendiente', label: 'Pendientes' },
                            { value: 'en_revision', label: 'En Revisión' },
                            { value: 'resuelto', label: 'Resueltos' },
                            { value: 'rechazado', label: 'Rechazados' },
                        ]}
                        value={filtroEstado}
                        onChange={setFiltroEstado}
                    />

                    <CustomDropdown
                        options={[
                            { value: 'todos', label: 'Todas las prioridades' },
                            { value: 'baja', label: 'Baja' },
                            { value: 'media', label: 'Media' },
                            { value: 'alta', label: 'Alta' },
                            { value: 'critica', label: 'Crítica' },
                        ]}
                        value={filtroPrioridad}
                        onChange={setFiltroPrioridad}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#1a1a1a]/60 border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Total Reportes</p>
                    <p className="text-2xl font-bold text-white mt-1">{reportes.length}</p>
                </div>
                <div className="bg-[#1a1a1a]/60 border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-400 mt-1">
                        {reportes.filter(r => r.estado === 'pendiente').length}
                    </p>
                </div>
                <div className="bg-[#1a1a1a]/60 border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">En Revisión</p>
                    <p className="text-2xl font-bold text-blue-400 mt-1">
                        {reportes.filter(r => r.estado === 'en_revision').length}
                    </p>
                </div>
                <div className="bg-[#1a1a1a]/60 border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Resueltos</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">
                        {reportes.filter(r => r.estado === 'resuelto').length}
                    </p>
                </div>
            </div>

            {/* Lista de Reportes */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        Cargando reportes...
                    </div>
                ) : reportesFiltrados.length === 0 ? (
                    <div className="text-center py-20 bg-[#1a1a1a]/40 border border-white/5 rounded-3xl">
                        <Flag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No se encontraron reportes</h3>
                        <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                ) : (
                    reportesFiltrados.map((reporte) => (
                        <div
                            key={reporte.id}
                            className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all"
                        >
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                {/* Info */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusBadge(reporte.estado)}`}>
                                            {getStatusIcon(reporte.estado)}
                                            {reporte.estado.charAt(0).toUpperCase() + reporte.estado.slice(1).replace('_', ' ')}
                                        </span>
                                        <span className="px-3 py-1 bg-white/5 text-gray-400 rounded-full text-xs border border-white/5">
                                            {getTipoLabel(reporte.tipo_reporte)}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPrioridadBadge(reporte.prioridad)}`}>
                                            {reporte.prioridad.toUpperCase()}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{reporte.categoria}</h3>
                                        <p className="text-gray-400 text-sm mb-2">{reporte.descripcion}</p>
                                        {reporte.tipo_reporte !== 'bug' && (
                                            <p className="text-blue-400 text-sm">
                                                📌 {getTipoLabel(reporte.tipo_reporte)}: {getEntidadNombre(reporte)}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <span>Reportado por: {reporte.reportante.nombre}</span>
                                        <span>•</span>
                                        <span>{new Date(reporte.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        {reporte.admin && (
                                            <>
                                                <span>•</span>
                                                <span>Gestionado por: {reporte.admin.nombre}</span>
                                            </>
                                        )}
                                    </div>

                                    {reporte.respuesta_admin && (
                                        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                            <p className="text-blue-400 text-sm font-medium mb-1">Respuesta del administrador:</p>
                                            <p className="text-gray-300 text-sm">{reporte.respuesta_admin}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Acciones */}
                                <div className="flex flex-col gap-2 lg:w-40">
                                    <button
                                        onClick={() => handleAccion(reporte.id, 'review')}
                                        disabled={reporte.estado === 'en_revision'}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Revisar
                                    </button>
                                    <button
                                        onClick={() => handleAccion(reporte.id, 'resolve')}
                                        disabled={reporte.estado === 'resuelto'}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Resolver
                                    </button>
                                    <button
                                        onClick={() => handleAccion(reporte.id, 'reject')}
                                        disabled={reporte.estado === 'rechazado'}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
