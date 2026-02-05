import { useState } from 'react';
import api from '@/lib/api';
import { X, Lock, Loader2 } from 'lucide-react';

interface SecurityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
}

export default function SecurityModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmación de Seguridad",
    description = "Esta acción requiere privilegios de administrador. Por favor confirma tu contraseña para continuar."
}: SecurityModalProps) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/verify-password', { password });
            onConfirm();
            setPassword(''); // Clear password on success
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Contraseña incorrecta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-2 text-red-600">
                        <Lock className="w-5 h-5" />
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-sm text-gray-600 mb-6">
                        {description}
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña de Administrador
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
                                placeholder="Ingresa tu contraseña"
                                autoFocus
                            />
                            {error && (
                                <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2">
                                    <span>⚠️</span> {error}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !password}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Confirmar Acción
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
