'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Search, CheckCircle, Clock, AlertCircle, MessageSquare, Star, Send } from 'lucide-react';

interface Comment {
    _id: string;
    mensaje: string; // Updated field name
    usuario_id?: { nombre: string }; // Optional
    fecha: string;
    es_interno: boolean;
}

interface TicketStatus {
    ticket_id: number;
    _id: string;
    titulo: string;
    estado: string;
    prioridad: string;
    fecha_creacion: string;
    agente_id?: { nombre: string };
    datos_contacto?: { nombre_completo: string };
    comments?: Comment[];
    calificacion?: number;
    mensaje_resolucion?: string;
}

export default function ConsultarPage() {
    const [ticketId, setTicketId] = useState('');
    const [ticket, setTicket] = useState<TicketStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Comment state
    const [newComment, setNewComment] = useState('');
    const [sendingComment, setSendingComment] = useState(false);

    // Rating state
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketId.trim()) return;

        setLoading(true);
        setError('');
        setTicket(null);

        try {
            const { data } = await api.get(`/tickets/status/${ticketId.trim()}`);
            console.log('Ticket loaded:', data);
            setTicket(data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'No se encontró un ticket con ese número.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !ticket) return;

        setSendingComment(true);
        try {
            await api.post(`/tickets/public/comment/${ticket.ticket_id}`, { texto: newComment });
            // Refresh
            const { data } = await api.get(`/tickets/status/${ticket.ticket_id}`);
            setTicket(data);
            setNewComment('');
        } catch (error) {
            console.error(error);
            alert('Error enviando mensaje');
        } finally {
            setSendingComment(false);
        }
    };

    const handleRateAndClose = async () => {
        if (rating === 0 || !ticket) return;
        if (!confirm('¿Estás seguro? Al cerrar el caso no podrás volver a comentar.')) return;

        setSubmittingRating(true);
        try {
            await api.put(`/tickets/public/rate/${ticket.ticket_id}`, { rating, feedback });
            alert('¡Gracias por tu calificación!');
            setTicket({ ...ticket, estado: 'cerrado', calificacion: rating, mensaje_resolucion: feedback });
        } catch (error) {
            console.error(error);
            alert('Error guardando calificación');
        } finally {
            setSubmittingRating(false);
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
            case 'cerrado': return 'Cerrado Definitivamente';
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

            <div className="max-w-xl w-full bg-white rounded-xl shadow-lg overflow-hidden my-8">
                <div className="bg-blue-900 p-6 text-center">
                    <h1 className="text-2xl font-bold text-white">Consulta de Ticket</h1>
                    <p className="text-blue-100 text-sm mt-1">Ingresa el código de tu solicitud</p>
                </div>

                <div className="p-8">
                    {!ticket ? (
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
                            {error && (
                                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5 mr-2" />
                                    {error}
                                </div>
                            )}
                        </form>
                    ) : (
                        <div className="animation-fade-in">
                            {/* Header Ticket */}
                            <div className="text-center mb-6 border-b pb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{ticket.titulo}</h2>
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(ticket.estado)}`}>
                                    {ticket.estado === 'resuelto' ? <CheckCircle className="h-4 w-4 mr-1.5" /> : <Clock className="h-4 w-4 mr-1.5" />}
                                    {getStatusLabel(ticket.estado)}
                                </span>
                                {ticket.estado === 'cerrado' && (
                                    <p className="mt-4 text-sm text-gray-500 italic border p-2 rounded bg-gray-50">
                                        "Este caso ha sido cerrado y no admite más respuestas."
                                    </p>
                                )}
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase">Solicitante</h3>
                                    <p className="text-gray-900">{ticket.datos_contacto?.nombre_completo || 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase">Técnico</h3>
                                    <p className="text-blue-600 font-medium">{ticket.agente_id?.nombre || 'Pendiente'}</p>
                                </div>
                            </div>

                            {/* Chat / Comentarios */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center">
                                    <MessageSquare className="h-3 w-3 mr-1" /> Historial de Mensajes
                                </h3>

                                <div className="space-y-4 max-h-80 overflow-y-auto mb-4 custom-scrollbar pr-2">
                                    {ticket.comments && ticket.comments.length > 0 ? (
                                        ticket.comments.map((c) => {
                                            const isAgent = !!c.usuario_id;
                                            return (
                                                <div key={c._id} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
                                                    <div className={`max-w-[85%] rounded-lg p-3 ${isAgent ? 'bg-white border border-gray-200' : 'bg-blue-100 text-blue-900'}`}>
                                                        <div className="flex justify-between items-center mb-1 gap-2">
                                                            <span className={`text-xs font-bold ${isAgent ? 'text-gray-700' : 'text-blue-800'}`}>
                                                                {c.usuario_id?.nombre || 'Tú'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400">
                                                                {new Date(c.fecha).toLocaleDateString()} {new Date(c.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm">{c.mensaje || (c as any).texto}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center italic py-4">
                                            No hay mensajes en el historial.
                                        </p>
                                    )}
                                </div>

                                {/* Input Area */}
                                {ticket.estado !== 'cerrado' && (
                                    <div className="flex gap-2 mt-2">
                                        <Input
                                            placeholder="Escribe un mensaje al técnico..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="text-black bg-white"
                                        />
                                        <Button
                                            onClick={handleAddComment}
                                            isLoading={sendingComment}
                                            disabled={!newComment.trim()}
                                            className="px-4"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Rating (Solo si resuelto) */}
                            {ticket.estado === 'resuelto' && (
                                <div className="bg-green-50 border border-green-100 rounded-lg p-5 text-center animation-fade-in">
                                    <h3 className="text-lg font-bold text-green-900 mb-2">¿Tu problema fue solucionado?</h3>
                                    <p className="text-sm text-green-700 mb-4">
                                        Por favor califica la atención para cerrar el ticket definitivamente.
                                    </p>

                                    <div className="flex justify-center space-x-2 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className={`transition-colors duration-150 transform hover:scale-110 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                            >
                                                <Star className="h-8 w-8 fill-current" />
                                            </button>
                                        ))}
                                    </div>

                                    {rating > 0 && (
                                        <div className="space-y-3">
                                            <Input
                                                placeholder="Comentario opcional sobre el servicio..."
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                className="bg-white text-black"
                                            />
                                            <Button onClick={handleRateAndClose} isLoading={submittingRating} className="w-full bg-green-600 hover:bg-green-700 text-white">
                                                Confirmar y Cerrar Caso
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-8 pt-4 border-t text-center">
                                <button
                                    onClick={() => { setTicket(null); setTicketId(''); }}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                >
                                    Consultar otro ticket
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
