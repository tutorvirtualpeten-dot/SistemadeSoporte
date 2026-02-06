'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ShieldCheck, User, Settings, Info } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SystemLog {
    _id: string;
    usuario_id: { nombre: string; email: string; rol: string };
    accion: string;
    detalles: any;
    ip?: string;
    fecha: string;
}

export default function SystemAuditPage() {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async (pageNum: number) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/audit?page=${pageNum}&limit=20`);
            setLogs(data.logs);
            setTotalPages(data.pages);
            setPage(data.page);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(1);
    }, []);

    const getIcon = (action: string) => {
        if (action.includes('LOGIN')) return <User className="h-4 w-4 text-green-500" />;
        if (action.includes('SETTINGS')) return <Settings className="h-4 w-4 text-orange-500" />;
        if (action.includes('USER')) return <ShieldCheck className="h-4 w-4 text-blue-500" />;
        return <Info className="h-4 w-4 text-gray-400" />;
    };

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Auditoría del Sistema
                    </h2>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {logs.map((log) => (
                        <li key={log._id}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm font-medium text-blue-600 truncate">
                                        <div className="mr-3 flex-shrink-0">
                                            {getIcon(log.accion)}
                                        </div>
                                        {log.accion}
                                        <span className="ml-2 text-gray-500 font-normal">
                                            por {log.usuario_id?.nombre || 'Usuario Eliminado'} ({log.usuario_id?.email})
                                        </span>
                                    </div>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {log.ip || 'IP N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            <code className="bg-gray-50 p-1 rounded text-xs">{JSON.stringify(log.detalles)}</code>
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                        <p>
                                            {format(new Date(log.fecha), "d MMM yyyy, HH:mm:ss", { locale: es })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                    {logs.length === 0 && !loading && (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No hay registros de auditoría.</li>
                    )}
                </ul>

                {/* Pagination Simple */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between">
                        <button
                            onClick={() => fetchLogs(page - 1)}
                            disabled={page === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-700 self-center">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            onClick={() => fetchLogs(page + 1)}
                            disabled={page === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
