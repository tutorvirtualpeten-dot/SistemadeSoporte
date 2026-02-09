'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import SecurityModal from '@/components/SecurityModal';

interface ServiceType {
    _id: string;
    nombre: string;
    descripcion: string;
    activo: boolean;
}

export default function ServiceTypeManager() {
    const [types, setTypes] = useState<ServiceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [newType, setNewType] = useState({ nombre: '', descripcion: '' });
    const [editType, setEditType] = useState({ nombre: '', descripcion: '' });
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            const { data } = await api.get('/service-types');
            setTypes(data);
        } catch (error) {
            console.error('Error fetching service types', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newType.nombre.trim()) return;
        try {
            const { data } = await api.post('/service-types', newType);
            setTypes([data, ...types]);
            setNewType({ nombre: '', descripcion: '' });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al agregar tipo de servicio');
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editType.nombre.trim()) return;
        try {
            const { data } = await api.put(`/service-types/${id}`, editType);
            setTypes(types.map(t => t._id === id ? data : t));
            setIsEditing(null);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al actualizar tipo de servicio');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/service-types/${deleteId}`);
            setTypes(types.filter(t => t._id !== deleteId));
            setDeleteId(null);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al eliminar tipo de servicio');
        }
    };

    const handleToggleActive = async (type: ServiceType) => {
        try {
            const { data } = await api.put(`/service-types/${type._id}`, { activo: !type.activo });
            setTypes(types.map(t => t._id === type._id ? data : t));
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al cambiar estado');
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Tipos de Servicio</h2>

            <div className="flex flex-col md:flex-row gap-2 mb-6">
                <input
                    type="text"
                    value={newType.nombre}
                    onChange={(e) => setNewType({ ...newType, nombre: e.target.value })}
                    placeholder="Nombre (ej. Mantenimiento)"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                />
                <input
                    type="text"
                    value={newType.descripcion}
                    onChange={(e) => setNewType({ ...newType, descripcion: e.target.value })}
                    placeholder="Descripción (opcional)"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                />
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                </button>
            </div>

            <div className="space-y-2">
                {loading ? <p>Cargando...</p> : types.map(type => (
                    <div key={type._id} className="flex flex-col md:flex-row items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 gap-2">
                        {isEditing === type._id ? (
                            <div className="flex flex-1 gap-2 w-full">
                                <input
                                    type="text"
                                    value={editType.nombre}
                                    onChange={(e) => setEditType({ ...editType, nombre: e.target.value })}
                                    className="flex-1 rounded-md border-gray-300 shadow-sm px-2 py-1 text-black"
                                    placeholder="Nombre"
                                />
                                <input
                                    type="text"
                                    value={editType.descripcion}
                                    onChange={(e) => setEditType({ ...editType, descripcion: e.target.value })}
                                    className="flex-1 rounded-md border-gray-300 shadow-sm px-2 py-1 text-black"
                                    placeholder="Descripción"
                                />
                                <button onClick={() => handleUpdate(type._id)} className="text-green-600">
                                    <Check className="h-5 w-5" />
                                </button>
                                <button onClick={() => setIsEditing(null)} className="text-red-500">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-medium ${type.activo ? 'text-gray-800' : 'text-gray-400'}`}>
                                            {type.nombre}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${type.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {type.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    {type.descripcion && (
                                        <span className="text-sm text-gray-500">{type.descripcion}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleActive(type)}
                                        className="text-gray-500 hover:text-blue-600 text-xs mr-2"
                                    >
                                        {type.activo ? 'Desactivar' : 'Activar'}
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(type._id); setEditType({ nombre: type.nombre, descripcion: type.descripcion }); }}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(type._id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {types.length === 0 && !loading && <p className="text-gray-500 text-center py-4">No hay tipos de servicio registrados.</p>}
            </div>

            <SecurityModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Eliminar Tipo de Servicio"
                description="¿Estás seguro? Esto podría afectar tickets históricos que usen este tipo."
            />
        </div>
    );
}
