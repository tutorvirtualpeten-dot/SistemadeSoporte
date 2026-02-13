'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import CommentSection from '@/components/CommentSection';
import TicketHistory from '@/components/TicketHistory';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Edit2, Save, X, Star } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

interface Ticket {
    _id: string;
    titulo: string;
    descripcion: string;
    estado: string;
    prioridad: string;
    fecha_creacion: string;
    ticket_id?: number;
    usuario_id?: { _id: string; nombre: string; email: string };
    datos_contacto?: { nombre_completo: string; telefono: string; dpi: string; email: string };
    archivo_adjunto?: string; // Legacy
    archivos?: { url: string; nombre_original: string; public_id: string }[];
    agente_id?: { _id: string; nombre: string; email: string };
    calificacion?: number;
    mensaje_resolucion?: string;
    categoria_id?: { _id: string; nombre: string };
    tipo_usuario?: string;
    sla_due_date?: string; // Admin specific
}

interface Agent {
    _id: string;
    nombre: string;
}

export default function AdminTicketDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Ticket>>({});

    const [agents, setAgents] = useState<Agent[]>([]);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const { data } = await api.get(`/tickets/${id}`);
                setTicket(data);
                // Inicializar datos de edición
                const { titulo, descripcion, datos_contacto, agente_id } = data;
                setEditData({
                    titulo,
                    descripcion,
                    datos_contacto,
                    agente_id: agente_id?._id // Guardar solo el ID para edición
                });
            } catch (error) {
                console.error(error);
                alert('Error cargando ticket');
                router.push('/admin/tickets');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchTicket();
    }, [id, router]);

    useEffect(() => {
        // En admin siempre cargamos agentes si se puede
        const fetchAgents = async () => {
            try {
                const { data } = await api.get('/admin/agents');
                setAgents(data);
            } catch (error) {
                console.error('Error fetching agents', error);
            }
        };
        fetchAgents();
    }, []);

    const getSLAStatus = (ticket: Ticket) => {
        if (ticket.estado === 'resuelto' || ticket.estado === 'cerrado') return null;

        // Use backend SLA date if available, otherwise fallback to calculation
        let limite: Date;

        if (ticket.sla_due_date) {
            limite = new Date(ticket.sla_due_date);
        } else {
            // Fallback calculation
            if (!ticket.fecha_creacion) return null;
            let horas = 72; // Default media
            switch (ticket.prioridad) {
                case 'critica': horas = 4; break;
                case 'alta': horas = 24; break;
                case 'media': horas = 72; break;
                case 'baja': horas = 168; break;
            }
            const creacion = new Date(ticket.fecha_creacion);
            limite = new Date(creacion.getTime() + horas * 60 * 60 * 1000);
        }

        const ahora = new Date();
        const diff = limite.getTime() - ahora.getTime();
        const diffHoras = diff / (1000 * 60 * 60);

        if (diff < 0) {
            return { label: `Vencido hace ${Math.abs(Math.round(diffHoras))}h`, color: 'bg-red-100 text-red-800 border-red-200' };
        } else if (diffHoras < 4) {
            return { label: `Vence en ${Math.round(diffHoras)}h`, color: 'bg-orange-100 text-orange-800 border-orange-200' };
        } else {
            const dias = Math.floor(diffHoras / 24);
            return { label: dias > 0 ? `${dias} días restantes` : `${Math.round(diffHoras)}h restantes`, color: 'bg-green-50 text-green-700 border-green-200' };
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('contacto.')) {
            const field = name.split('.')[1];
            setEditData(prev => ({
                ...prev,
                datos_contacto: { ...prev.datos_contacto as any, [field]: value }
            }));
        } else {
            setEditData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        if (!ticket) return;
        try {
            const { data } = await api.put(`/tickets/${ticket._id}`, editData);
            setTicket(data);
            setIsEditing(false);
            alert('Ticket actualizado correctamente');
        } catch (error) {
            console.error(error);
            alert('Error al actualizar el ticket');
        }
    };

    const handleAssign = async (agentId: string) => {
        if (!ticket) return;
        try {
            const { data } = await api.put(`/tickets/${ticket._id}`, { agente_id: agentId });
            setTicket(data);
            alert(`Ticket asignado a ${data.agente_id?.nombre}`);
        } catch (error) {
            console.error(error);
            alert('Error al asignar agente');
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (!ticket) return <div>Ticket no encontrado</div>;

    const sla = getSLAStatus(ticket);

    return (
        <div className="max-w-4xl mx-auto bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" onClick={() => router.back()} className="mr-2 border-gray-300">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        {isEditing ? (
                            <div className="space-y-2">
                                <Input
                                    name="titulo"
                                    value={editData.titulo}
                                    onChange={handleEditChange}
                                    className="font-bold text-lg"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {ticket.titulo}
                                </h3>
                                {sla && (
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-md border ${sla.color}`}>
                                        {sla.label}
                                    </span>
                                )}
                            </div>
                        )}
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Ticket #{ticket.ticket_id || ticket._id}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Selector de Estado */}
                    <select
                        value={ticket.estado}
                        onChange={async (e) => {
                            const newStatus = e.target.value;
                            if (!ticket) return;
                            try {
                                const { data } = await api.put(`/tickets/${ticket._id}`, { estado: newStatus });
                                setTicket(data);
                                alert(`Estado actualizado a: ${newStatus.toUpperCase()}`);
                            } catch (error) {
                                console.error(error);
                                alert('Error actualizando estado');
                            }
                        }}
                        className={`text-xs font-bold rounded-full px-3 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                            ${ticket.estado === 'abierto' ? 'bg-green-100 text-green-800' :
                                ticket.estado === 'cerrado' ? 'bg-gray-100 text-gray-800' :
                                    ticket.estado === 'resuelto' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'}`
                        }
                    >
                        <option value="abierto">ABIERTO</option>
                        <option value="en_progreso">EN PROGRESO</option>
                        <option value="resuelto">RESUELTO</option>
                        <option value="cerrado">CERRADO</option>
                    </select>

                    {!isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit2 className="h-4 w-4 text-gray-500" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Asignar a Técnico:</span>
                <select
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black p-2"
                    value={ticket.agente_id?._id || ''}
                    onChange={(e) => handleAssign(e.target.value)}
                >
                    <option value="">-- Sin Asignar --</option>
                    {agents.map(agent => (
                        <option key={agent._id} value={agent._id} className="text-black">
                            {agent.nombre}
                        </option>
                    ))}
                </select>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                {isEditing ? (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-100">
                            <h4 className="text-sm font-bold text-blue-800 mb-2">Modo Edición</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold text-gray-900">Teléfono</label>
                                    <Input
                                        name="contacto.telefono"
                                        value={editData.datos_contacto?.telefono}
                                        onChange={handleEditChange}
                                        className="text-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900">Email Contacto</label>
                                    <Input
                                        name="contacto.email"
                                        value={editData.datos_contacto?.email}
                                        onChange={handleEditChange}
                                        className="text-black"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-900">Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        rows={4}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                        value={editData.descripcion}
                                        onChange={handleEditChange}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-4">
                                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                    <X className="h-4 w-4 mr-1" /> Cancelar
                                </Button>
                                <Button onClick={handleSave}>
                                    <Save className="h-4 w-4 mr-1" /> Guardar Cambios
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Solicitante</dt>
                            <dd className="mt-1 text-sm text-gray-900">{ticket.usuario_id?.nombre || ticket.datos_contacto?.nombre_completo || 'Anónimo'}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Prioridad</dt>
                            <dd className="mt-1 text-sm text-gray-900 capitalize flex items-center gap-2">
                                {ticket.prioridad}
                                {sla && (
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-md border ${sla.color}`}>
                                        {sla.label}
                                    </span>
                                )}
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Contacto</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {ticket.datos_contacto?.telefono} <br />
                                {ticket.datos_contacto?.email}
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">DPI</dt>
                            <dd className="mt-1 text-sm text-gray-900">{ticket.datos_contacto?.dpi || '-'}</dd>
                        </div>

                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Tipo de Usuario</dt>
                            <dd className="mt-1 text-sm text-gray-900 capitalize px-2 py-0.5 rounded bg-gray-100 inline-block font-medium">
                                {ticket.tipo_usuario || 'No especificado'}
                            </dd>
                        </div>

                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Categoría</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-medium">
                                {ticket.categoria_id?.nombre || 'General'}
                            </dd>
                        </div>

                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                            <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                                {ticket.descripcion}
                            </dd>
                        </div>

                        {/* Archivos Adjuntos (Múltiples + Legacy) */}
                        {(ticket.archivos && ticket.archivos.length > 0 || ticket.archivo_adjunto) && (
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Archivos Adjuntos</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                                        {/* Legacy Single File */}
                                        {ticket.archivo_adjunto && !ticket.archivos?.length && (
                                            <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                                <div className="w-0 flex-1 flex items-center">
                                                    <span className="ml-2 flex-1 w-0 truncate">Adjunto Principal</span>
                                                </div>
                                                <div className="ml-4 flex-shrink-0">
                                                    <a href={ticket.archivo_adjunto} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-500">
                                                        Ver
                                                    </a>
                                                </div>
                                            </li>
                                        )}

                                        {/* New Array Files */}
                                        {ticket.archivos?.map((file, index) => (
                                            <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                                <div className="w-0 flex-1 flex items-center">
                                                    <span className="ml-2 flex-1 w-0 truncate">
                                                        {file.nombre_original || `Archivo ${index + 1}`}
                                                    </span>
                                                </div>
                                                <div className="ml-4 flex-shrink-0">
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-500">
                                                        Descargar
                                                    </a>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </dd>
                            </div>
                        )}
                    </dl>
                )}

                {/* Feedback del Usuario */}
                {ticket.calificacion && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Calificación del Usuario: {ticket.calificacion} / 5
                                </h3>
                                {ticket.mensaje_resolucion && (
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>"{ticket.mensaje_resolucion}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="border-t border-gray-200 mt-8 pt-8">
                    <CommentSection ticketId={ticket._id} />
                </div>

                <div className="border-t border-gray-200 mt-8 pt-8 px-4 sm:px-6 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Historial de Actividad</h3>
                    <TicketHistory ticketId={ticket._id} />
                </div>
            </div>
        </div>
    );
}
