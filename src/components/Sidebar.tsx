'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Ticket,
    Bell,
    Calendar,
    PlusCircle,
    BarChart3,
    Users,
    FileText,
    Briefcase,
    History,
    ScanLine,
    ChevronLeft,
    ChevronRight,
    Settings,
    ShieldAlert,
    Flag,
    MessageCircle,
    HelpCircle
} from 'lucide-react';
import ReportModal from '@/components/ReportModal';

let toggleMobileSidebarFn: (() => void) | null = null;
export function toggleMobileSidebar() {
    if (toggleMobileSidebarFn) {
        toggleMobileSidebarFn();
    }
}

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = useState(0);
    const [showBugModal, setShowBugModal] = useState(false);
    const [pendingChats, setPendingChats] = useState(0);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            setUser(userData);
        }
    }, []);

    useEffect(() => {
        toggleMobileSidebarFn = () => setIsMobileMenuOpen(prev => !prev);
        return () => {
            toggleMobileSidebarFn = null;
        }
    }, []);

    // Polling para notificaciones de chat (Solo Admin)
    useEffect(() => {
        if (!user || user.tipo_usuario !== 'admin') return;

        const checkChatStatus = async () => {
            try {
                const res = await fetch('/api/admin/chat/status');
                const data = await res.json();
                if (data.success) {
                    setPendingChats(data.pendingCount);
                }
            } catch (error) {
                console.error('Error checking chat status:', error);
            }
        };

        checkChatStatus(); // Initial check
        const interval = setInterval(checkChatStatus, 30000); // Check every 30s

        return () => clearInterval(interval);
    }, [user]);

    const getSidebarOptions = () => {
        if (!user) return [];

        const commonOptions = [
            { label: 'Dashboard', href: `/dashboard/${user.tipo_usuario}`, icon: LayoutDashboard },
        ];

        switch (user.tipo_usuario) {
            case 'asistente':
                return [
                    ...commonOptions,
                    { label: 'Mis Reservas', href: '/dashboard/asistente/reservas', icon: Ticket },
                    { label: 'Ayuda', href: '/dashboard/ayuda', icon: HelpCircle },
                ];
            case 'organizador':
                return [
                    ...commonOptions,
                    { label: 'Mis Eventos', href: '/dashboard/organizador/eventos', icon: Calendar },
                    { label: 'Crear Evento', href: '/dashboard/organizador/crear', icon: PlusCircle },
                    { label: 'Analíticas', href: '/dashboard/organizador/analiticas', icon: BarChart3 },
                    { label: 'Proveedores', href: '/dashboard/organizador/proveedores', icon: Users },
                    { label: 'Servicios', href: '/dashboard/organizador/servicios-contratados', icon: Briefcase },
                    { label: 'Ayuda', href: '/dashboard/ayuda', icon: HelpCircle },
                ];
            case 'proveedor':
                return [
                    ...commonOptions,
                    { label: 'Mis Servicios', href: '/dashboard/proveedor/servicios', icon: Briefcase },
                    { label: 'Agregar Servicio', href: '/dashboard/proveedor/servicios/crear', icon: PlusCircle },
                    { label: 'Solicitudes', href: '/dashboard/proveedor/solicitudes', icon: FileText },
                    { label: 'Historial', href: '/dashboard/proveedor/historial', icon: History },
                    { label: 'Ayuda', href: '/dashboard/ayuda', icon: HelpCircle },
                ];
            case 'staff':
                return [
                    ...commonOptions,
                    { label: 'Escanear', href: '/dashboard/staff/escanear', icon: ScanLine },
                    { label: 'Asistentes', href: '/dashboard/staff/asistentes', icon: Users },
                    { label: 'Reportes', href: '/dashboard/staff/reportes', icon: FileText },
                    { label: 'Ayuda', href: '/dashboard/ayuda', icon: HelpCircle },
                ];
            case 'admin':
                return [
                    ...commonOptions,
                    { label: 'Usuarios', href: '/dashboard/admin/usuarios', icon: Users },
                    { label: 'Eventos', href: '/dashboard/admin/eventos', icon: Calendar },
                    { label: 'Servicios', href: '/dashboard/admin/servicios', icon: Briefcase },
                    {
                        label: 'Chat',
                        href: '/dashboard/admin/chat',
                        icon: MessageCircle,
                        badge: pendingChats > 0 ? pendingChats : undefined
                    },
                    { label: 'Reportes', href: '/dashboard/admin/reportes', icon: FileText },
                    { label: 'Auditoría', href: '/dashboard/admin/auditoria', icon: ShieldAlert },
                ];
            default:
                return commonOptions;
        }
    };

    const sidebarOptions = getSidebarOptions();

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                fixed left-0 top-0 h-screen 
                bg-[#0a0a0a]/95 border-r border-white/10 
                transition-all duration-300 z-50
                ${isCollapsed ? 'w-20' : 'w-72'}
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className={`h-20 flex items-center border-b border-white/5 transition-all ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
                        <Link href="/" className="flex items-center gap-3 group">
                            <img
                                src="/logo.svg"
                                alt="Logo"
                                className="w-8 h-8 rounded-lg shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all"
                            />
                            {!isCollapsed && (
                                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                    EventPlatform
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Toggle Button */}
                    <div className="absolute -right-3 top-24 hidden md:block">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-500 transition-colors"
                        >
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className={`flex-1 py-6 space-y-2 overflow-y-auto ${isCollapsed ? 'scrollbar-none px-2' : 'custom-scrollbar px-4'}`}>

                        {!isCollapsed && (
                            <div className="px-2 mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {user?.tipo_usuario || 'Menu'}
                            </div>
                        )}

                        {sidebarOptions.map((option, index) => {
                            const Icon = option.icon;
                            const isActive = pathname === option.href;
                            // @ts-ignore
                            const badgeCount = option.badge;

                            return (
                                <Link
                                    key={option.href}
                                    href={option.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    onMouseEnter={(e) => {
                                        if (isCollapsed) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setTooltipPos(rect.top);
                                            setHoveredIndex(index);
                                        }
                                    }}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        } ${isCollapsed ? 'justify-center' : ''}`}
                                >
                                    <div className="relative">
                                        <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                                        {badgeCount && isCollapsed && (
                                            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border border-[#0a0a0a]">
                                                {badgeCount}
                                            </span>
                                        )}
                                    </div>

                                    {!isCollapsed && (
                                        <div className="flex-1 flex items-center justify-between">
                                            <span className="font-medium text-sm">{option.label}</span>
                                            {badgeCount && (
                                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                    {badgeCount}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Tooltip for collapsed state */}
                                    {isCollapsed && hoveredIndex === index && (
                                        <div
                                            className="fixed left-20 px-3 py-2 bg-gray-800 text-white text-xs rounded-md shadow-xl border border-white/10 z-[100] whitespace-nowrap animate-in fade-in slide-in-from-left-2"
                                            style={{ top: tooltipPos + 10 }}
                                        >
                                            {option.label}
                                            {badgeCount && ` (${badgeCount})`}
                                            {/* Arrow */}
                                            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className={`border-t border-white/5 bg-black/20 transition-all ${isCollapsed ? 'p-2' : 'p-4'} space-y-1`}>
                        <button
                            onClick={() => setShowBugModal(true)}
                            className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-red-400 transition-all ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? "Reportar Problema" : ""}
                        >
                            <Flag size={20} />
                            {!isCollapsed && <span className="font-medium text-sm">Reportar Problema</span>}
                        </button>
                        <Link
                            href="/dashboard/configuracion"
                            className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <Settings size={20} />
                            {!isCollapsed && <span className="font-medium text-sm">Configuración</span>}
                        </Link>
                    </div>
                </div>
            </aside>

            <ReportModal
                isOpen={showBugModal}
                onClose={() => setShowBugModal(false)}
                tipo="bug"
                reportanteId={user?.id}
            />
        </>
    );
}
