'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import SecurityModal from '@/components/SecurityModal';

interface TicketSource {
    _id: string;
    nombre: string;
    activo: boolean;
}

export default function TicketSourceManager() {
    const [sources, setSources] = useState<TicketSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [newSource, setNewSource] = useState('');
    const [editSource, setEditSource] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = async () => {
        try {
            const { data } = await api.get('/ticket-sources');
            setSources(data);
        } catch (error) {
            console.error('Error fetching sources', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newSource.trim()) return;
        try {
            const { data } = await api.post('/ticket-sources', { nombre: newSource });
            setSources([data, ...sources]);
            setNewSource('');
        } catch (error) {
            alert('Error al agregar fuente');
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editSource.trim()) return;
        try {
            const { data } = await api.put(`/ticket-sources/${id}`, { nombre: editSource });
            setSources(sources.map(s => s._id === id ? data : s));
            setIsEditing(null);
            setEditSource('');
        } catch (error) {
            alert('Error al actualizar fuente');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/ticket-sources/${deleteId}`);
            setSources(sources.filter(s => s._id !== deleteId));
            setDeleteId(null);
        } catch (error) {
            alert('Error al eliminar fuente');
        }
    };

    const handleToggleActive = async (source: TicketSource) => {
        try {
            const { data } = await api.put(`/ticket-sources/${source._id}`, { activo: !source.activo });
            setSources(sources.map(s => s._id === source._id ? data : s));
        } catch (error) {
            alert('Error al cambiar estado');
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Fuentes de Ticket / Medios de Recepción</h2>

            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="Nueva fuente (ej. Llamada, Presencial)"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                />
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                </button>
            </div>

            <div className="space-y-2">
                {loading ? <p>Cargando...</p> : sources.map(source => (
                    <div key={source._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                        {isEditing === source._id ? (
                            <div className="flex flex-1 gap-2">
                                <input
                                    type="text"
                                    value={editSource}
                                    onChange={(e) => setEditSource(e.target.value)}
                                    className="flex-1 rounded-md border-gray-300 shadow-sm px-2 py-1 text-black"
                                />
                                <button onClick={() => handleUpdate(source._id)} className="text-green-600">
                                    <Check className="h-5 w-5" />
                                </button>
                                <button onClick={() => setIsEditing(null)} className="text-red-500">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <span className={`font-medium ${source.activo ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {source.nombre}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${source.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {source.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleActive(source)}
                                        className="text-gray-500 hover:text-blue-600 text-xs mr-2"
                                    >
                                        {source.activo ? 'Desactivar' : 'Activar'}
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(source._id); setEditSource(source.nombre); }}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(source._id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {sources.length === 0 && !loading && <p className="text-gray-500 text-center py-4">No hay fuentes registradas.</p>}
            </div>

            <SecurityModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Eliminar Fuente"
                description="¿Estás seguro? Esto podría afectar tickets históricos que usen esta fuente."
            />
        </div>
    );
}
