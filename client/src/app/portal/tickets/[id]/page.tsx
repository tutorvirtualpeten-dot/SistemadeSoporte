'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import CommentSection from '@/components/CommentSection';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';
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
    archivo_adjunto?: string;
    agente_id?: { _id: string; nombre: string; email: string };
}

interface Agent {
    _id: string;
    nombre: string;
}

export default function TicketDetailPage() {
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
                router.push('/portal');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchTicket();
    }, [id, router]);

    useEffect(() => {
        if (user && (user.rol === 'admin' || user.rol === 'super_admin')) {
            const fetchAgents = async () => {
                try {
                    console.log('Fetching agents from /admin/agents...');
                    const { data } = await api.get('/admin/agents');
                    console.log('Agents received:', data);
                    setAgents(data);
                } catch (error) {
                    console.error('Error fetching agents', error);
                }
            };
            fetchAgents();
        }
    }, [user]);

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

    const isAdmin = user?.rol === 'admin' || user?.rol === 'super_admin';
    const canEdit = ticket.estado !== 'cerrado' && (
        isAdmin ||
        (ticket.usuario_id && ticket.usuario_id._id === user?._id)
    );

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
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {ticket.titulo}
                            </h3>
                        )}
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Ticket #{ticket.ticket_id || ticket._id}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Selector de Estado (Solo Admins/Agentes) */}
                    {(user?.rol === 'admin' || user?.rol === 'super_admin' || user?.rol === 'agente') ? (
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
                    ) : (
                        <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${ticket.estado === 'abierto' ? 'bg-green-100 text-green-800' :
                                ticket.estado === 'cerrado' ? 'bg-gray-100 text-gray-800' :
                                    ticket.estado === 'resuelto' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'}`}>
                            {ticket.estado.toUpperCase()}
                        </div>
                    )}

                    {canEdit && !isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit2 className="h-4 w-4 text-gray-500" />
                        </Button>
                    )}
                </div>
            </div>

            {isAdmin && (
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
            )}

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
                            <dd className="mt-1 text-sm text-gray-900 capitalize">{ticket.prioridad}</dd>
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
                            <dd className="mt-1 text-sm text-gray-900">{ticket.datos_contacto?.dpi}</dd>
                        </div>

                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                            <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                                {ticket.descripcion}
                            </dd>
                        </div>

                        {ticket.archivo_adjunto && (
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Archivo Adjunto</dt>
                                <dd className="mt-1 text-sm text-blue-600">
                                    <a href={ticket.archivo_adjunto} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        Ver Archivo
                                    </a>
                                </dd>
                            </div>
                        )}
                    </dl>
                )}

                <div className="border-t border-gray-200 mt-8 pt-8">
                    <CommentSection ticketId={ticket._id} />
                </div>
            </div>
        </div>
    );
}
