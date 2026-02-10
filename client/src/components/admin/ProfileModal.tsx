'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, User, Lock, Save, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Visibilidad de contraseñas
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Las nuevas contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-password`,
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Contraseña actualizada correctamente');
            onClose();
            // Resetear formulario
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error actualizando contraseña:', error);
            const message = error.response?.data?.message || 'Error al actualizar contraseña';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-900 opacity-90"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                                        Perfil de Usuario
                                    </h3>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-gray-700">Nombre</label>
                                        <div className="mt-1 p-2.5 bg-gray-50 rounded-md text-gray-900 border border-gray-300 font-medium">
                                            {user?.nombre}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-gray-700">Rol</label>
                                        <div className="mt-1 p-2.5 bg-gray-50 rounded-md text-gray-900 border border-gray-300 capitalize font-medium">
                                            {user?.rol?.replace('_', ' ')}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-gray-700">Email</label>
                                        <div className="mt-1 p-2.5 bg-gray-50 rounded-md text-gray-900 border border-gray-300 font-medium">
                                            {user?.email}
                                        </div>
                                    </div>

                                    <hr className="my-6 border-gray-200" />

                                    <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center">
                                        <Lock className="h-4 w-4 mr-2 text-blue-600" />
                                        Cambiar Contraseña
                                    </h4>

                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-gray-700">Contraseña Actual (Obligatorio)</label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    required
                                                    className="block w-full pr-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 border placeholder-gray-400 text-gray-900"
                                                    placeholder="Ingresa tu contraseña actual"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                                    {showCurrentPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                    minLength={6}
                                                    className="block w-full pr-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 border placeholder-gray-400 text-gray-900"
                                                    placeholder="Mínimo 6 caracteres"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowNewPassword(!showNewPassword)}>
                                                    {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                minLength={6}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 border placeholder-gray-400 text-gray-900"
                                                placeholder="Repite la nueva contraseña"
                                            />
                                        </div>

                                        <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                            >
                                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                                                <Save className="ml-2 h-4 w-4" />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
