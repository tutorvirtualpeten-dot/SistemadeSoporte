'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Edit2, Trash2, CheckCircle, XCircle, Plus, Tag } from 'lucide-react';

interface Category {
    _id: string;
    nombre: string;
    tipo: 'docente' | 'administrativo' | 'global';
    activo: boolean;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCat, setCurrentCat] = useState<Partial<Category>>({ tipo: 'docente', activo: true });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentCat._id) {
                await api.put(`/categories/${currentCat._id}`, currentCat);
            } else {
                await api.post('/categories', currentCat);
            }
            fetchCategories();
            resetForm();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al guardar categoría';
            alert(msg);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentCat({ nombre: '', tipo: 'docente', activo: true });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>

            {/* Formulario */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    {currentCat._id ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <Input
                            label="Nombre"
                            value={currentCat.nombre || ''}
                            onChange={(e) => setCurrentCat({ ...currentCat, nombre: e.target.value })}
                            required
                            className="text-black"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black sm:text-sm"
                            value={currentCat.tipo}
                            onChange={(e) => setCurrentCat({ ...currentCat, tipo: e.target.value as any })}
                        >
                            <option value="docente">Docente</option>
                            <option value="administrativo">Administrativo</option>
                            <option value="global">Global</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit">
                            {currentCat._id ? 'Actualizar' : 'Agregar'}
                        </Button>
                        {currentCat._id && (
                            <Button type="button" variant="secondary" onClick={resetForm}>
                                Cancelar
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            {/* Lista */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={4} className="p-4 text-center">Cargando...</td></tr>
                            ) : categories.map((cat) => (
                                <tr key={cat._id}>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.nombre}</td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{cat.tipo}</td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {cat.activo ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Inactivo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => setCurrentCat(cat)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat._id)}
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
