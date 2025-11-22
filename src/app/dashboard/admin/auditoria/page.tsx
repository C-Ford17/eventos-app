'use client';
import { useEffect, useState } from 'react';
import { Shield, Search, Calendar, User, Database } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';

export default function AdminAuditPage() {
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        try {
            const res = await fetch('/api/admin/audit');
            const data = await res.json();
            if (data.success) {
                setAuditLogs(data.logs);
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = log.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.tabla?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesAction = false;
        if (filterAction === 'all') {
            matchesAction = true;
        } else if (filterAction === 'LOGIN') {
            matchesAction = ['login_exitoso', 'intento_login_bloqueado'].includes(log.accion);
        } else if (filterAction === 'BLOCK') {
            matchesAction = [
                'bloquear_usuario', 'desbloquear_usuario',
                'bloquear_evento', 'desbloquear_evento',
                'bloquear_servicio', 'desbloquear_servicio',
                'reject_reporte'
            ].includes(log.accion);
        } else if (filterAction === 'CREATE') {
            matchesAction = ['crear_reporte', 'crear_evento', 'crear_servicio'].includes(log.accion);
        } else if (filterAction === 'UPDATE') {
            matchesAction = [
                'review_reporte', 'resolve_reporte',
                'actualizar_evento', 'actualizar_servicio'
            ].includes(log.accion);
        } else {
            matchesAction = log.accion === filterAction;
        }

        return matchesSearch && matchesAction;
    });

    const getActionLabel = (action: string) => {
        const labels: any = {
            // Login
            login_exitoso: 'Login Exitoso',
            intento_login_bloqueado: 'Login Bloqueado',

            // Create
            crear_reporte: 'Crear Reporte',
            crear_evento: 'Crear Evento',
            crear_servicio: 'Crear Servicio',

            // Update / Moderation
            bloquear_usuario: 'Bloquear Usuario',
            desbloquear_usuario: 'Desbloquear Usuario',
            bloquear_evento: 'Bloquear Evento',
            desbloquear_evento: 'Desbloquear Evento',
            bloquear_servicio: 'Bloquear Servicio',
            desbloquear_servicio: 'Desbloquear Servicio',
            review_reporte: 'Revisar Reporte',
            resolve_reporte: 'Resolver Reporte',
            reject_reporte: 'Rechazar Reporte',
            actualizar_evento: 'Editar Evento',
            actualizar_servicio: 'Editar Servicio',

            // Fallback
            CREATE: 'Creación',
            UPDATE: 'Edición',
            DELETE: 'Eliminación',
            LOGIN: 'Inicio de Sesión',
        };
        return labels[action] || action;
    };

    const getActionBadge = (action: string) => {
        if (['login_exitoso', 'LOGIN'].includes(action)) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        if (['intento_login_bloqueado'].includes(action)) return 'bg-red-500/10 text-red-400 border-red-500/20';

        if (['crear_reporte', 'crear_evento', 'crear_servicio', 'CREATE'].includes(action)) return 'bg-green-500/10 text-green-400 border-green-500/20';

        if ([
            'bloquear_usuario', 'bloquear_evento', 'bloquear_servicio', 'reject_reporte', 'DELETE', 'BLOCK'
        ].includes(action)) return 'bg-red-500/10 text-red-400 border-red-500/20';

        if ([
            'desbloquear_usuario', 'desbloquear_evento', 'desbloquear_servicio',
            'review_reporte', 'resolve_reporte', 'actualizar_evento', 'actualizar_servicio', 'UPDATE'
        ].includes(action)) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';

        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Auditoría del Sistema</h1>
                <p className="text-gray-400">Historial completo de acciones en la plataforma</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por usuario o tabla..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="w-full md:w-64">
                    <CustomDropdown
                        options={[
                            { value: 'all', label: 'Todas las acciones' },
                            { value: 'CREATE', label: 'Creación' },
                            { value: 'UPDATE', label: 'Edición' },
                            { value: 'BLOCK', label: 'Bloqueo' },
                            { value: 'LOGIN', label: 'Inicio de Sesión' },
                        ]}
                        value={filterAction}
                        onChange={setFilterAction}
                        placeholder="Filtrar por acción"
                    />
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Fecha</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Usuario</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Acción</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tabla</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        Cargando registros de auditoría...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron registros
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} />
                                                {new Date(log.createdAt).toLocaleString('es-ES')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-white">
                                                <User size={16} />
                                                {log.usuario?.nombre || 'Sistema'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionBadge(log.accion)}`}>
                                                {getActionLabel(log.accion)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Database size={16} />
                                                {log.tabla}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">
                                            {log.detalles || 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Total Registros</p>
                    <p className="text-2xl font-bold text-white mt-1">{auditLogs.length}</p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Creaciones</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {auditLogs.filter(l => ['crear_reporte', 'crear_evento', 'crear_servicio', 'CREATE'].includes(l.accion)).length}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Actualizaciones</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {auditLogs.filter(l => ['review_reporte', 'resolve_reporte', 'actualizar_evento', 'actualizar_servicio', 'UPDATE'].includes(l.accion)).length}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Bloqueos</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {auditLogs.filter(l => ['bloquear_usuario', 'desbloquear_usuario', 'bloquear_evento', 'desbloquear_evento', 'bloquear_servicio', 'desbloquear_servicio', 'reject_reporte', 'BLOCK'].includes(l.accion)).length}
                    </p>
                </div>
            </div>
        </div >
    );
}
