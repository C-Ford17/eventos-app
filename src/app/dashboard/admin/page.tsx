'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, DollarSign, Activity, Settings, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEvents: 0,
        totalRevenue: 0,
        activeEvents: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Panel de Administración
                </h1>
                <p className="text-gray-400">
                    Visión general y control total de la plataforma.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                            <Users size={24} />
                        </div>
                        <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium">Usuarios Totales</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</h3>
                </div>

                <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                            <Calendar size={24} />
                        </div>
                        <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">+5%</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium">Eventos Totales</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.totalEvents}</h3>
                </div>

                <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">+18%</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium">Ingresos Totales</p>
                    <h3 className="text-2xl font-bold text-white mt-1">${stats.totalRevenue.toLocaleString()}</h3>
                </div>

                <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">
                            <Activity size={24} />
                        </div>
                        <span className="text-xs font-medium text-gray-400 bg-white/5 px-2 py-1 rounded-full">Actual</span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium">Eventos Activos</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.activeEvents}</h3>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <ShieldAlert size={20} className="text-red-400" />
                        Acciones Críticas
                    </h3>
                    <div className="space-y-3">
                        <Link href="/dashboard/admin/usuarios" className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                            <span className="text-gray-300 group-hover:text-white">Gestionar Usuarios</span>
                            <Users size={18} className="text-gray-500 group-hover:text-white" />
                        </Link>
                        <Link href="/dashboard/admin/reportes" className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                            <span className="text-gray-300 group-hover:text-white">Revisar Reportes de Eventos</span>
                            <ShieldAlert size={18} className="text-gray-500 group-hover:text-white" />
                        </Link>
                    </div>
                </div>

                <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Settings size={20} className="text-blue-400" />
                        Configuración del Sistema
                    </h3>
                    <div className="space-y-3">
                        <Link href="/dashboard/configuracion" className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                            <span className="text-gray-300 group-hover:text-white">Configuración General</span>
                            <Settings size={18} className="text-gray-500 group-hover:text-white" />
                        </Link>
                        <Link href="/dashboard/admin/auditoria" className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                            <span className="text-gray-300 group-hover:text-white">Auditoría de Sistema</span>
                            <Activity size={18} className="text-gray-500 group-hover:text-white" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
