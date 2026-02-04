'use client';

import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

import LogoImage from '@/components/LogoImage';
import NotificationBell from '@/components/NotificationBell';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const { settings } = useSettings();

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link href="/portal" className="flex-shrink-0 flex items-center font-bold text-xl text-blue-600">
                                <LogoImage
                                    src={settings.logo_url}
                                    className="h-8 w-auto mr-2"
                                />
                                <span className={settings.logo_url ? "hidden sm:inline" : ""}>
                                    {settings.nombre_app || 'Soporte Petén'}
                                </span>
                            </Link>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {!['admin', 'super_admin'].includes(user?.rol || '') && (
                                    <Link href="/portal" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Mis Tickets
                                    </Link>
                                )}
                                {!['admin', 'super_admin'].includes(user?.rol || '') && (
                                    <Link href="/portal/create" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Nuevo Ticket
                                    </Link>
                                )}
                                <Link href="/faq" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Preguntas Frecuentes
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="mr-4">
                                <NotificationBell />
                            </div>
                            <span className="text-gray-700 text-sm mr-4">Hola, {user?.nombre}</span>
                            <Button variant="secondary" onClick={logout} className="text-xs">
                                Salir
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
