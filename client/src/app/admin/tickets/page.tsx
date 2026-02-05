'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import SecurityModal from '@/components/SecurityModal';

interface Ticket {
    _id: string;
    ticket_id: number;
    titulo: string;
    estado: string;
    prioridad: string;
    calificacion?: number;
    usuario_id: { nombre: string };
    datos_contacto?: { nombre_completo: string, email: string };
    fecha_creacion: string;
}

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

    const fetchTickets = async () => {
        try {
            const { data } = await api.get('/tickets'); // Admin endpoint returns all
            setTickets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleDeleteClick = (id: string) => {
        setTicketToDelete(id);
        setIsSecurityModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!ticketToDelete) return;

        try {
            await api.delete(`/tickets/${ticketToDelete}`);
            fetchTickets();
            setTicketToDelete(null);
        } catch (error) {
            alert('Error eliminando ticket');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            abierto: 'bg-green-100 text-green-800',
            en_progreso: 'bg-yellow-100 text-yellow-800',
            resuelto: 'bg-blue-100 text-blue-800',
            cerrado: 'bg-gray-100 text-gray-800'
        };
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
                {status.toUpperCase().replace('_', ' ')}
            </span>
        );
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Tickets</h1>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># ID</th>
                                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto</th>
                                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calificación</th>
                                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tickets.map((ticket) => (
                                <tr key={ticket._id}>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-900">
                                        {ticket.ticket_id || 'N/A'}
                                    </td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{ticket.titulo}</div>
                                        <div className="text-xs text-gray-500 capitalize">{ticket.prioridad}</div>
                                    </td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {ticket.datos_contacto?.nombre_completo || ticket.usuario_id?.nombre || 'Anónimo'}
                                        <div className="text-xs text-gray-400">{ticket.datos_contacto?.email}</div>
                                    </td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(ticket.estado)}
                                    </td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                                        {ticket.calificacion ? (
                                            <div className="flex text-yellow-400">
                                                {[...Array(ticket.calificacion)].map((_, i) => (
                                                    <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(ticket.fecha_creacion).toLocaleDateString()}
                                    </td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/portal/tickets/${ticket._id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                                            <Eye className="h-5 w-5 inline" />
                                        </Link>
                                        <button onClick={() => handleDeleteClick(ticket._id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-5 w-5 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {tickets.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-500">No hay tickets registrados aún.</div>
                )}
            </div>

            <SecurityModal
                isOpen={isSecurityModalOpen}
                onClose={() => setIsSecurityModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Ticket"
                description="Estás a punto de eliminar un ticket permanentemente. Esta acción no se puede deshacer. Por favor confirma tu contraseña."
            />
        </div>
    );
}

