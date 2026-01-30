'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Edit2, Trash2, HelpCircle, Eye, EyeOff } from 'lucide-react';

interface FAQ {
    _id: string;
    pregunta: string;
    respuesta: string;
    categoria: string;
    visible: boolean;
}

export default function GenericFAQsPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentFaq, setCurrentFaq] = useState<Partial<FAQ>>({ visible: true, categoria: 'General' });

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const { data } = await api.get('/faqs/admin');
            setFaqs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentFaq._id) {
                await api.put(`/faqs/admin/${currentFaq._id}`, currentFaq);
            } else {
                await api.post('/faqs/admin', currentFaq);
            }
            fetchFaqs();
            resetForm();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al guardar FAQ';
            alert(msg);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta pregunta?')) return;
        try {
            await api.delete(`/faqs/admin/${id}`);
            fetchFaqs();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const resetForm = () => {
        setCurrentFaq({ pregunta: '', respuesta: '', categoria: 'General', visible: true });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Base de Conocimiento (FAQs)</h1>

            {/* Formulario */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    {currentFaq._id ? 'Editar Pregunta' : 'Nueva Pregunta Frecuente'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Input
                                label="Pregunta"
                                value={currentFaq.pregunta || ''}
                                onChange={(e) => setCurrentFaq({ ...currentFaq, pregunta: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black sm:text-sm"
                                rows={4}
                                value={currentFaq.respuesta || ''}
                                onChange={(e) => setCurrentFaq({ ...currentFaq, respuesta: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Input
                                label="Categoría"
                                value={currentFaq.categoria || ''}
                                onChange={(e) => setCurrentFaq({ ...currentFaq, categoria: e.target.value })}
                                required
                                placeholder="Ej: General, Hardware, Cuenta"
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                    checked={currentFaq.visible}
                                    onChange={(e) => setCurrentFaq({ ...currentFaq, visible: e.target.checked })}
                                />
                                <span className="text-gray-900 text-sm font-medium">Visible para usuarios</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                        {currentFaq._id && (
                            <Button type="button" variant="secondary" onClick={resetForm}>
                                Cancelar
                            </Button>
                        )}
                        <Button type="submit">
                            {currentFaq._id ? 'Actualizar Base de Conocimiento' : 'Guardar Pregunta'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Lista */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pregunta</th>
                                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Visible</th>
                                <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={4} className="p-4 text-center">Cargando...</td></tr>
                            ) : faqs.map((faq) => (
                                <tr key={faq._id}>
                                    <td className="px-3 md:px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{faq.pregunta}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-xs">{faq.respuesta}</div>
                                    </td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {faq.categoria}
                                        </span>
                                    </td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                        {faq.visible ? (
                                            <Eye className="h-5 w-5 text-green-500 mx-auto" />
                                        ) : (
                                            <EyeOff className="h-5 w-5 text-gray-400 mx-auto" />
                                        )}
                                    </td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => setCurrentFaq(faq)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(faq._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
