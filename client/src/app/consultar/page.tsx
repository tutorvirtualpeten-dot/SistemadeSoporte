'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TicketStatus {
    ticket_id: number;
    titulo: string;
    estado: string;
    prioridad: string;
    fecha_creacion: string;
    agente_id?: { nombre: string };
    datos_contacto?: { nombre_completo: string };
}

export default function ConsultarPage() {
    const [ticketId, setTicketId] = useState('');
    const [ticket, setTicket] = useState<TicketStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketId.trim()) return;

        setLoading(true);
        setError('');
        setTicket(null);

        try {
            const { data } = await api.get(`/tickets/status/${ticketId.trim()}`);
            setTicket(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'No se encontró un ticket con ese número.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'abierto': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'en_progreso': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'resuelto': return 'bg-green-100 text-green-800 border-green-200';
            case 'cerrado': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'abierto': return 'Pendiente / Abierto';
            case 'en_progreso': return 'En Revisión';
            case 'resuelto': return 'Resuelto';
            case 'cerrado': return 'Cerrado';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="absolute top-4 left-4">
                <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Volver al Inicio
                </Link>
            </div>

            <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-900 p-6 text-center">
                    <h1 className="text-2xl font-bold text-white">Consulta de Ticket</h1>
                    <p className="text-blue-100 text-sm mt-1">Ingresa el código de tu solicitud</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <Input
                                placeholder="Ej: 10045"
                                value={ticketId}
                                onChange={(e) => setTicketId(e.target.value)}
                                className="text-center font-mono text-lg tracking-wide text-black placeholder-gray-500"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" isLoading={loading}>
                            <Search className="h-4 w-4 mr-2" />
                            Consultar Estado
                        </Button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            {error}
                        </div>
                    )}

                    {ticket && (
                        <div className="mt-8 border-t pt-6 animation-fade-in">
                            <div className="text-center mb-4">
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(ticket.estado)}`}>
                                    {ticket.estado === 'resuelto' ? <CheckCircle className="h-4 w-4 mr-1.5" /> : <Clock className="h-4 w-4 mr-1.5" />}
                                    {getStatusLabel(ticket.estado)}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Asunto</h3>
                                    <p className="text-gray-900 font-medium">{ticket.titulo}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Solicitante</h3>
                                        <p className="text-gray-700 text-sm">{ticket.datos_contacto?.nombre_completo || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha</h3>
                                        <p className="text-gray-700 text-sm">{new Date(ticket.fecha_creacion).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {ticket.agente_id && (
                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Técnico Asignado</h3>
                                        <p className="text-blue-900 font-medium text-sm">{ticket.agente_id.nombre}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
