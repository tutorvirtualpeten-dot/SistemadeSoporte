'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

function RegisterForm() {
    const router = useRouter();

    useEffect(() => {
        router.push('/auth/login');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">Registro Deshabilitado</h2>
                <p className="mt-2 text-gray-600">Redirigiendo al inicio de sesión...</p>
            </div>
        </div>
    );
}

/* Original code commented out
function RegisterFormOld() {
    const { login } = useAuth();
    // ... rest of the code
*/
function RegisterFormOld() {
    const { login } = useAuth();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'docente',
        departamento: '',
        materia: '',
        dpi: '',
        telefono: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [roleLocked, setRoleLocked] = useState(false);

    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam && (roleParam === 'docente' || roleParam === 'administrativo')) {
            setFormData(prev => ({ ...prev, rol: roleParam }));
            setRoleLocked(true);
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/register', formData);
            login(data.token, data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        if (roleLocked) {
            return formData.rol === 'docente' ? 'Registro de Docente' : 'Registro Administrativo';
        }
        return 'Crear Cuenta';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-900 capitalize">
                        {getTitle()}
                    </h2>
                    {roleLocked && (
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Ingresa tus datos para completar tu perfil
                        </p>
                    )}
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            label="Nombre Completo"
                            name="nombre"
                            required
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Ej: Juan Pérez"
                        />
                        <Input
                            label="DPI / CUI"
                            name="dpi"
                            required
                            value={formData.dpi}
                            onChange={handleChange}
                            placeholder="Número de DPI"
                        />
                        <Input
                            label={formData.rol === 'administrativo' ? "Correo Institucional" : "Correo Electrónico"}
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <Input
                            label="Teléfono (Para notificar por WhatsApp)"
                            name="telefono"
                            required
                            value={formData.telefono}
                            onChange={handleChange}
                            placeholder="5555-5555"
                        />
                        <Input
                            label="Contraseña"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                        />

                        {!roleLocked && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuario</label>
                                <select
                                    name="rol"
                                    value={formData.rol}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="docente">Docente</option>
                                    <option value="administrativo">Administrativo</option>
                                </select>
                            </div>
                        )}

                        {formData.rol === 'docente' && (
                            <Input
                                label="Materia o Curso Asignado"
                                name="materia"
                                value={formData.materia}
                                onChange={handleChange}
                                placeholder="Ej: Matemáticas I"
                            />
                        )}

                        {formData.rol === 'administrativo' && (
                            <Input
                                label="Departamento / Área"
                                name="departamento"
                                value={formData.departamento}
                                onChange={handleChange}
                                placeholder="Ej: Recursos Humanos"
                            />
                        )}

                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-12 text-lg" isLoading={loading}>
                        {roleLocked ? 'Continuar al Ticket' : 'Registrarse'}
                    </Button>

                    <div className="text-center mt-4">
                        <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-500">
                            ¿Ya tienes cuenta? Inicia Sesión
                        </Link>
                        {roleLocked && (
                            <div className="mt-2">
                                <Link href="/" className="text-xs text-gray-500 hover:underline">
                                    ← Volver al inicio
                                </Link>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

// Wrap in Suspense for useSearchParams
export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <RegisterForm />
        </Suspense>
    );
}
