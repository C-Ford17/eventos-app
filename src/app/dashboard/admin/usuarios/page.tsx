'use client';
import { useEffect, useState } from 'react';
import { Users, Search, Shield, Ban, CheckCircle, Filter } from 'lucide-react';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserAction = async (userId: string, action: 'block' | 'unblock') => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action }),
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers(); // Refresh the list
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.tipo_usuario === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
        const colors: any = {
            admin: 'bg-red-500/10 text-red-400 border-red-500/20',
            organizador: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            proveedor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            asistente: 'bg-green-500/10 text-green-400 border-green-500/20',
            staff: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        };
        return colors[role] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Gestión de Usuarios</h1>
                <p className="text-gray-400">Administra todos los usuarios de la plataforma</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                    <option value="all">Todos los roles</option>
                    <option value="asistente">Asistente</option>
                    <option value="organizador">Organizador</option>
                    <option value="proveedor">Proveedor</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Usuario</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rol</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Registro</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.foto_perfil_url ? (
                                                    <img
                                                        src={user.foto_perfil_url}
                                                        alt={user.nombre}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                        {user.nombre.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="text-white font-medium">{user.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.tipo_usuario)}`}>
                                                {user.tipo_usuario}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {user.bloqueado ? (
                                                    <>
                                                        <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full border border-red-500/20">
                                                            Bloqueado
                                                        </span>
                                                        <button
                                                            onClick={() => handleUserAction(user.id, 'unblock')}
                                                            className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                                            title="Desbloquear usuario"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUserAction(user.id, 'block')}
                                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Bloquear usuario"
                                                    >
                                                        <Ban size={18} />
                                                    </button>
                                                )}
                                            </div>
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
                    <p className="text-gray-400 text-sm">Total Usuarios</p>
                    <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Asistentes</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {users.filter(u => u.tipo_usuario === 'asistente').length}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Organizadores</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {users.filter(u => u.tipo_usuario === 'organizador').length}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl">
                    <p className="text-gray-400 text-sm">Proveedores</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {users.filter(u => u.tipo_usuario === 'proveedor').length}
                    </p>
                </div>
            </div>
        </div>
    );
}
