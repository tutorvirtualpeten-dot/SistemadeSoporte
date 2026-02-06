'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, Edit2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CannedResponse {
    _id: string;
    titulo: string;
    contenido: string;
    atajo?: string;
}

export default function CannedResponsesPage() {
    const [responses, setResponses] = useState<CannedResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentResponse, setCurrentResponse] = useState<Partial<CannedResponse>>({
        titulo: '', contenido: '', atajo: ''
    });

    const fetchResponses = async () => {
        try {
            const { data } = await api.get('/canned-responses');
            setResponses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResponses();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentResponse._id) {
                await api.put(`/canned-responses/${currentResponse._id}`, currentResponse);
            } else {
                await api.post('/canned-responses', currentResponse);
            }
            fetchResponses();
            resetForm();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error guardando respuesta');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar esta respuesta?')) return;
        try {
            await api.delete(`/canned-responses/${id}`);
            fetchResponses();
        } catch (error) {
            alert('Error eliminando respuesta');
        }
    };

    const handleEdit = (response: CannedResponse) => {
        setCurrentResponse(response);
        setIsEditing(true);
    };

    const resetForm = () => {
        setCurrentResponse({ titulo: '', contenido: '', atajo: '' });
        setIsEditing(false);
    };

    return (
        <div>
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Respuestas Rápidas
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Formulario */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow sm:rounded-lg p-6 sticky top-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {isEditing ? 'Editar Respuesta' : 'Nueva Respuesta'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Título</label>
                                <Input
                                    value={currentResponse.titulo}
                                    onChange={(e) => setCurrentResponse({ ...currentResponse, titulo: e.target.value })}
                                    placeholder="Ej: Saludo Inicial"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Atajo (Opcional)</label>
                                <Input
                                    value={currentResponse.atajo || ''}
                                    onChange={(e) => setCurrentResponse({ ...currentResponse, atajo: e.target.value })}
                                    placeholder="Ej: hola"
                                />
                                <p className="text-xs text-gray-500 mt-1">Escribe este atajo en el chat para insertar rápido.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contenido</label>
                                <textarea
                                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black"
                                    rows={4}
                                    value={currentResponse.contenido}
                                    onChange={(e) => setCurrentResponse({ ...currentResponse, contenido: e.target.value })}
                                    placeholder="Texto de la respuesta..."
                                    required
                                />
                            </div>
                            <div className="flex space-x-2">
                                <Button type="submit" className="w-full">
                                    <SaveIcon className="h-4 w-4 mr-2" />
                                    {isEditing ? 'Actualizar' : 'Guardar'}
                                </Button>
                                {isEditing && (
                                    <Button type="button" variant="secondary" onClick={resetForm}>
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Lista */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {responses.map((response) => (
                                <li key={response._id} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center mb-1">
                                                <p className="text-sm font-medium text-blue-600 truncate">{response.titulo}</p>
                                                {response.atajo && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                                                        {response.atajo}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2">{response.contenido}</p>
                                        </div>
                                        <div className="flex-shrink-0 ml-4 flex space-x-2">
                                            <button onClick={() => handleEdit(response)} className="text-gray-400 hover:text-blue-500">
                                                <Edit2 className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => handleDelete(response._id)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {responses.length === 0 && !loading && (
                                <li className="p-6 text-center text-gray-500">
                                    No hay respuestas configuradas.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SaveIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    )
}
