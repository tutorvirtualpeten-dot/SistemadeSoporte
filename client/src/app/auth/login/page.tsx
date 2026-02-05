'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LogoImage from '@/components/LogoImage';

export default function LoginPage() {
    const { login } = useAuth();
    const { settings, loading: settingsLoading } = useSettings();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data.token, data);
        } catch (err: any) {
            const message = err.response?.data?.message;
            if (message) {
                setError(message);
            } else if (err.request) {
                setError('Error de conexión. Verifique que el servidor esté encendido y accesible.');
            } else {
                setError('Error al iniciar sesión');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="absolute top-4 left-4">
                <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Volver al Inicio
                </Link>
            </div>

            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    {settingsLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-4">
                            <div className="h-24 w-24 bg-gray-200 animate-pulse rounded-lg" />
                            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-center mb-4">
                                <LogoImage
                                    src={settings.logo_url}
                                    className="h-24 w-auto object-contain"
                                />
                            </div>
                            <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-900">
                                {settings.nombre_app || 'Soporte Petén'}
                            </h2>
                            <p className="mt-2 text-center text-sm text-gray-600">
                                Acceso para Personal de Soporte
                            </p>
                        </>
                    )}
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            label="Correo Electrónico"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="usuario@soporte.com"
                        />
                        <Input
                            label="Contraseña"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {/* <div className="flex flex-col items-center justify-end space-y-2">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                    </div> */}

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-12 text-lg" isLoading={loading}>
                        Iniciar Sesión
                    </Button>
                </form>
            </div>
        </div>
    );
}
