'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Pencil, X } from 'lucide-react';

interface User {
    _id: string;
    nombre: string;
    email: string;
    rol: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ nombre: '', email: '', password: '', rol: 'agente' });

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openModal = (user: User | null = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ nombre: user.nombre, email: user.email, password: '', rol: user.rol });
        } else {
            setEditingUser(null);
            setFormData({ nombre: '', email: '', password: '', rol: 'agente' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Update
                const payload: any = { ...formData };
                if (!payload.password) delete payload.password; // Don't send empty password
                await api.put(`/admin/users/${editingUser._id}`, payload);
            } else {
                // Create
                await api.post('/admin/users', formData);
            }
            closeModal();
            fetchUsers();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error guardando usuario';
            alert(msg);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (error) {
            alert('Error eliminando usuario');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <Button onClick={() => openModal()}>
                    Agregar Usuario
                </Button>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nombre}</td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.rol}</td>
                                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openModal(user)} className="text-blue-600 hover:text-blue-900 mr-4">
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                            <X className="h-6 w-6" />
                        </button>
                        <h2 className="text-xl font-bold mb-4">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                placeholder="Nombre Completo"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                required
                            />
                            <Input
                                placeholder="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <div>
                                <Input
                                    placeholder={editingUser ? "Contraseña (déjalo vacío si no cambia)" : "Contraseña"}
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                />
                                {editingUser && <p className="text-xs text-gray-500 mt-1">Solo llena este campo si deseas cambiar la contraseña.</p>}
                            </div>

                            <select
                                value={formData.rol}
                                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="agente">Agente (Técnico)</option>
                                <option value="admin">Administrador</option>
                                <option value="super_admin">Super Administrador</option>
                            </select>

                            <div className="flex justify-end pt-2">
                                <Button type="button" variant="secondary" className="mr-2" onClick={closeModal}>Cancelar</Button>
                                <Button type="submit">{editingUser ? 'Actualizar' : 'Guardar'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
