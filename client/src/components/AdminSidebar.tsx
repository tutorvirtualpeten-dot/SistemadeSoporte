'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Ticket, Menu, Settings, X, Files, HelpCircle, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { Button } from './ui/Button';
import LogoImage from './LogoImage';
import ProfileModal from './admin/ProfileModal';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { settings, loading } = useSettings(); // Use settings context
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['admin', 'super_admin', 'agente'] },
        { name: 'Tickets', href: '/admin/tickets', icon: Ticket, roles: ['admin', 'super_admin', 'agente'] },
        // Solo super_admin ve usuarios
        { name: 'Usuarios', href: '/admin/users', icon: Users, roles: ['super_admin'] },
        { name: 'Categorías', href: '/admin/categories', icon: Files, roles: ['admin', 'super_admin'] },
        { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle, roles: ['admin', 'super_admin'] },
        { name: 'Respuestas', href: '/admin/responses', icon: Files, roles: ['admin', 'super_admin', 'agente'] },
        { name: 'Catálogos', href: '/admin/settings/catalogs', icon: Files, roles: ['admin', 'super_admin', 'agente'] },
        { name: 'Auditoría', href: '/admin/audit', icon: ShieldCheck, roles: ['super_admin'] },
        { name: 'Configuración', href: '/admin/settings', icon: Settings, roles: ['admin', 'super_admin'] },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center justify-between bg-blue-900 text-white p-4">
                <div className="flex items-center space-x-2">
                    {loading ? (
                        <div className="h-8 w-32 bg-blue-800/50 animate-pulse rounded" />
                    ) : (
                        <>
                            <LogoImage
                                src={settings.logo_url}
                                className="h-8 w-auto"
                            />
                            {!settings.logo_url && <span className="font-bold ml-2">{settings.nombre_app || 'Admin Panel'}</span>}
                        </>
                    )}
                </div>
                <button onClick={toggleSidebar}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            <div className={`
                fixed inset-y-0 left-0 bg-slate-900 text-white w-64 transform transition-transform duration-200 ease-in-out z-30
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block
            `}>
                <div className="flex flex-col h-full">
                    <div className="h-16 flex items-center justify-center bg-slate-800 shadow-md px-4 overflow-hidden">
                        {loading ? (
                            <div className="h-10 w-10 bg-slate-700 animate-pulse rounded-full" />
                        ) : (
                            <LogoImage
                                src={settings.logo_url}
                                alt="Admin Logo"
                                className="h-10 max-w-full object-contain"
                            />
                        )}
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navigation.map((item) => {
                            // 1. Filtro base por rol hardcoded (para items fijos o seguridad base)
                            if (!user || !item.roles.includes(user.rol)) return null;

                            // 2. Filtro dinámico por Configuración de Módulos (si aplica)
                            // Mapeo href -> key en modulos
                            const moduleMap: { [key: string]: string } = {
                                '/admin/tickets': 'tickets',
                                '/admin/categories': 'categories',
                                '/admin/faqs': 'faqs',
                                '/admin/responses': 'responses',
                                '/admin/settings/catalogs': 'catalogs',
                                '/admin/settings': 'settings',
                                // 'dashboard' y 'users' (super_admin) suelen quedar fijos o se agregan aquí si se desea dinámico
                            };

                            const moduleKey = moduleMap[item.href];

                            // Si el módulo está configurado en settings.modulos
                            if (moduleKey && settings.modulos && settings.modulos[moduleKey]) {
                                // Si NO eres super_admin Y tu rol NO está en la lista permitida -> Ocultar
                                if (user.rol !== 'super_admin' && !settings.modulos[moduleKey].includes(user.rol)) {
                                    return null;
                                }
                            }

                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        flex items-center px-4 py-3 rounded-lg transition-colors
                                        ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                                    `}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 bg-slate-800">
                        <div
                            className="mb-4 cursor-pointer hover:bg-slate-700 rounded-lg p-3 transition-colors flex items-center group"
                            onClick={() => setIsProfileModalOpen(true)}
                        >
                            <div className="bg-slate-700 group-hover:bg-slate-600 p-2 rounded-full mr-3 transition-colors">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{user?.nombre}</p>
                                <p className="text-xs text-slate-300 capitalize">{user?.rol?.replace('_', ' ')}</p>
                                <p className="text-[10px] text-blue-400 mt-0.5 font-medium">Editar Perfil</p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white border-none"
                            onClick={logout}
                        >
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Profile Modal */}
            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
        </>
    );
}
