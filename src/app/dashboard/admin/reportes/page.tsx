'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, Search, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        // Simulación de datos (conectar a API real después)
        setTimeout(() => {
            setReports([
                {
                    id: 1,
                    type: 'evento',
                    title: 'Evento con contenido inapropiado',
                    description: 'El evento contiene imágenes no apropiadas',
                    reporter: 'usuario@example.com',
                    status: 'pendiente',
                    createdAt: new Date().toISOString(),
                },
                {
                    id: 2,
                    type: 'usuario',
                    title: 'Usuario con comportamiento sospechoso',
                    description: 'Usuario reportado por spam',
                    reporter: 'otro@example.com',
                    status: 'resuelto',
                    createdAt: new Date().toISOString(),
                },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const colors: any = {
            pendiente: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            en_revision: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            resuelto: 'bg-green-500/10 text-green-400 border-green-500/20',
            rechazado: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return colors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pendiente':
                return <Clock size={16} />;
            case 'resuelto':
                return <CheckCircle size={16} />;
            case 'rechazado':
                return <XCircle size={16} />;
            default:
                return <AlertTriangle size={16} />;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Reportes</h1>
                <p className="text-gray-400">Gestiona reportes de usuarios y eventos</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar reportes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                    <option value="all">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_revision">En Revisión</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="rechazado">Rechazado</option>
                </select>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Cargando reportes...</div>
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">No se encontraron reportes</div>
                ) : (
                    filteredReports.map((report) => (
                        <div
                            key={report.id}
                            className="bg-[#121212] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusBadge(report.status)}`}>
                                            {getStatusIcon(report.status)}
                                            {report.status}
                                        </span>
                                        <span className="px-3 py-1 bg-white/5 text-gray-400 rounded-full text-xs">
                                            {report.type}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{report.title}</h3>
                                        <p className="text-gray-400 text-sm">{report.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>Reportado por: {report.reporter}</span>
                                        <span>•</span>
                                        <span>{new Date(report.createdAt).toLocaleDateString('es-ES')}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                                        Revisar
                                    </button>
                                    <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors">
                                        Resolver
                                    </button>
                                    <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors">
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Total Reportes</p>
                    <p className="text-2xl font-bold text-white mt-1">{reports.length}</p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Pendientes</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {reports.filter(r => r.status === 'pendiente').length}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">En Revisión</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {reports.filter(r => r.status === 'en_revision').length}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Resueltos</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {reports.filter(r => r.status === 'resuelto').length}
                    </p>
                </div>
            </div>
        </div>
    );
}
