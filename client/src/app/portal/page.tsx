'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Ticket {
    _id: string;
    titulo: string;
    estado: string;
    prioridad: string;
    fecha_creacion: string;
    ticket_id?: number;
}

export default function PortalDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    const [sort, setSort] = useState('fecha_creacion_desc');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const [sortBy, order] = sort === 'fecha_creacion_desc' ? ['fecha_creacion', 'desc'] :
                    sort === 'fecha_creacion_asc' ? ['fecha_creacion', 'asc'] :
                        sort === 'ticket_id_desc' ? ['ticket_id', 'desc'] :
                            sort === 'ticket_id_asc' ? ['ticket_id', 'asc'] :
                                sort === 'estado' ? ['estado', 'asc'] : ['fecha_creacion', 'desc'];

                const { data } = await api.get(`/tickets?sortBy=${sortBy}&order=${order}`);
                setTickets(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [sort]);

    if (loading) return <div>Cargando tickets...</div>;

    return (
        <div>
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0 flex items-center">
                    <Button variant="primary" onClick={() => router.back()} className="mr-4">
                        <ArrowLeft className="h-5 w-5 mr-1" />
                        Regresar
                    </Button>
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Mis Solicitudes
                    </h2>
                </div>
                {!['admin', 'super_admin'].includes(user?.rol || '') && (
                    <div className="mt-4 flex md:mt-0 md:ml-4 items-center space-x-3">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="block pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                        >
                            <option value="fecha_creacion_desc">Más recientes</option>
                            <option value="fecha_creacion_asc">Más antiguos</option>
                            <option value="ticket_id_desc">ID (Desc)</option>
                            <option value="ticket_id_asc">ID (Asc)</option>
                            <option value="estado">Estado</option>
                        </select>
                        <Link href="/portal/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Ticket
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {tickets.length === 0 ? (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No tienes tickets creados aún.
                        </li>
                    ) : (
                        tickets.map((ticket) => (
                            <li key={ticket._id}>
                                <Link href={`/portal/tickets/${ticket._id}`} className="block hover:bg-gray-50 transition duration-150 ease-in-out">
                                    <div className="items-center px-4 py-4 sm:px-6">
                                        <div className="min-w-0 flex-1 flex items-center justify-between">
                                            <div className="truncate">
                                                <div className="flex text-sm">
                                                    <p className="font-medium text-blue-600 truncate">{ticket.titulo}</p>
                                                    <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                                        #{ticket._id.slice(-6)}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        Creado el {new Date(ticket.fecha_creacion).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-5 flex-shrink-0">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                           ${ticket.estado === 'abierto' ? 'bg-green-100 text-green-800' :
                                                        ticket.estado === 'cerrado' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {ticket.estado}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
