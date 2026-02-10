'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { Trash2, Eye, Plus } from 'lucide-react';
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
    agente_id?: { _id: string; nombre: string }; // Added field
    datos_contacto?: { nombre_completo: string, email: string };
    fecha_creacion: string;
}

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

    // Filters
    const [showPendingOnly, setShowPendingOnly] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedAgent, setSelectedAgent] = useState(''); // Agent Filter

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

    // Extract unique agents from tickets
    const agents = useMemo(() => {
        const uniqueAgents = new Map();
        tickets.forEach(ticket => {
            if (ticket.agente_id) {
                uniqueAgents.set(ticket.agente_id._id, ticket.agente_id.nombre);
            }
        });
        return Array.from(uniqueAgents.entries()).map(([id, nombre]) => ({ id, nombre }));
    }, [tickets]);

    const filteredTickets = tickets.filter(ticket => {
        // Status Filter
        if (showPendingOnly) {
            if (ticket.estado === 'resuelto' || ticket.estado === 'cerrado') {
                return false;
            }
        }

        // Agent Filter
        if (selectedAgent) {
            if (ticket.agente_id?._id !== selectedAgent) {
                return false;
            }
        }

        // Date Filter
        if (startDate) {
            const ticketDate = new Date(ticket.fecha_creacion);
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0); // Start of day
            if (ticketDate < start) return false;
        }
        if (endDate) {
            const ticketDate = new Date(ticket.fecha_creacion);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // End of day
            if (ticketDate > end) return false;
        }

        return true;
    });

    const exportToExcel = async () => {
        const xlsx = await import('xlsx');
        const worksheet = xlsx.utils.json_to_sheet(filteredTickets.map(t => ({
            ID: t.ticket_id,
            Asunto: t.titulo,
            Estado: t.estado,
            Prioridad: t.prioridad,
            Solicitante: t.datos_contacto?.nombre_completo || t.usuario_id?.nombre || 'Anónimo',
            Agente: t.agente_id?.nombre || 'Sin Asignar',
            Email: t.datos_contacto?.email || '',
            Fecha: new Date(t.fecha_creacion).toLocaleDateString()
        })));
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Tickets");
        xlsx.writeFile(workbook, "tickets_reporte.xlsx");
    };

    const exportToPDF = async () => {
        const jsPDF = (await import('jspdf')).default;
        const autoTable = (await import('jspdf-autotable')).default;

        const doc = new jsPDF();

        autoTable(doc, {
            head: [['ID', 'Asunto', 'Estado', 'Prioridad', 'Solicitante', 'Agente', 'Fecha']],
            body: filteredTickets.map(t => [
                t.ticket_id,
                t.titulo,
                t.estado,
                t.prioridad,
                t.datos_contacto?.nombre_completo || t.usuario_id?.nombre || 'Anónimo',
                t.agente_id?.nombre || 'Sin Asignar',
                new Date(t.fecha_creacion).toLocaleDateString()
            ]),
        });

        doc.save("tickets_reporte.pdf");
    };

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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Tickets</h1>
                <Link
                    href="/admin/tickets/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Ticket Interno
                </Link>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap items-center gap-4">
                <label className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                        type="checkbox"
                        checked={showPendingOnly}
                        onChange={(e) => setShowPendingOnly(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Solo Pendientes/Proceso</span>
                </label>

                <div className="h-8 w-px bg-gray-300 mx-2 hidden md:block"></div>

                {/* Agent Selector */}
                <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="block pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                >
                    <option value="">Todos los Agentes</option>
                    {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                            {agent.nombre}
                        </option>
                    ))}
                </select>

                <div className="h-8 w-px bg-gray-300 mx-2 hidden md:block"></div>

                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                            placeholder="dd/mm/aaaa"
                        />
                    </div>
                    <span className="text-gray-500">-</span>
                    <div className="relative">
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                            placeholder="dd/mm/aaaa"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setShowPendingOnly(false); // Uncheck "Solo Pendientes" as shown in image
                            setStartDate('');
                            setEndDate('');
                            setSelectedAgent(''); // Reset Agent
                        }}
                        className="p-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        title="Limpiar filtros"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <button
                        className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </button>
                </div>

                <div className="h-8 w-px bg-gray-300 mx-2 hidden md:block"></div>

                <div className="flex items-center space-x-2 ml-auto">
                    <button
                        onClick={exportToExcel}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Excel
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        PDF
                    </button>
                </div>
            </div>

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
                            {filteredTickets.map((ticket) => (
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
                {filteredTickets.length === 0 && !loading && (
                    <div className="p-6 text-center text-gray-500">No hay tickets que coincidan con los filtros.</div>
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

