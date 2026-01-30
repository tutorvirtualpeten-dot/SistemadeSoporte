'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
    BarChart3,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface Stats {
    totalTickets: number;
    pendientes: number;
    enProceso: number;
    resueltos: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <div>Cargando métricas...</div>;

    const cards = [
        { name: 'Total Tickets', value: stats.totalTickets, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Pendientes', value: stats.pendientes, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
        { name: 'En Proceso', value: stats.enProceso, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { name: 'Resueltos', value: stats.resueltos, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard de Administración</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 rounded-md p-3 ${card.bg}`}>
                                    <card.icon className={`h-6 w-6 ${card.color}`} aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">{card.value}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
                <p className="text-gray-500 text-sm">Próximamente: Gráficas detalladas y feed de actividad.</p>
            </div>
        </div>
    );
}
