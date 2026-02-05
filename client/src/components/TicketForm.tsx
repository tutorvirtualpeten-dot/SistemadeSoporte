'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface TicketFormProps {
    publicMode?: boolean;
    initialRole?: string;
}

interface Category {
    _id: string;
    nombre: string;
    tipo: 'docente' | 'administrativo' | 'global';
    activo: boolean;
}

export default function TicketForm({ publicMode = false, initialRole = 'docente' }: TicketFormProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [ticketId, setTicketId] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const [formData, setFormData] = useState({
        nombre_completo: '',
        email: '',
        telefono_whatsapp: '',
        dpi: '',
        titulo: '',
        descripcion: '',
        prioridad: 'media',
        categoria_id: '',
        rol: initialRole // Para modo público
    });

    // Estado separado para archivos
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nombre_completo: user.nombre || '',
                email: user.email || '',
                telefono_whatsapp: user.telefono || '',
                dpi: user.dpi || ''
            }));
        } else if (publicMode) {
            setFormData(prev => ({ ...prev, rol: initialRole }));
        }
    }, [user, publicMode, initialRole]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('titulo', formData.titulo);
            formDataToSend.append('descripcion', formData.descripcion);
            formDataToSend.append('prioridad', formData.prioridad);
            formDataToSend.append('tipo_usuario', user ? user.rol : formData.rol);
            formDataToSend.append('categoria_id', formData.categoria_id);

            // Datos contacto
            formDataToSend.append('datos_contacto[nombre_completo]', formData.nombre_completo);
            formDataToSend.append('datos_contacto[email]', formData.email);
            formDataToSend.append('datos_contacto[telefono]', formData.telefono_whatsapp);
            formDataToSend.append('datos_contacto[dpi]', formData.dpi);

            // Archivos
            if (selectedFiles) {
                for (let i = 0; i < selectedFiles.length; i++) {
                    formDataToSend.append('archivos', selectedFiles[i]);
                }
            }

            const { data } = await api.post('/tickets', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (publicMode && !user) {
                setTicketId(data.ticket_id.toString()); // Usar el ID numérico
                setSuccess(true);
            } else {
                router.push('/portal');
            }

        } catch (error: any) {
            console.error('Error creando ticket', error);
            const msg = error.response?.data?.message || error.message || 'Error desconocido';
            alert(`Error al crear el ticket: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white p-8 rounded-lg shadow text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Ticket Recibido</h3>
                <p className="mt-2 text-sm text-gray-500">
                    Tu solicitud ha sido enviada correctamente.
                </p>
                {ticketId && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-bold text-gray-700">Número de Ticket:</p>
                        <p className="text-2xl font-mono text-blue-700 tracking-wider">{ticketId}</p>
                        <p className="text-xs text-gray-500 mt-1">Guarda este código para consultar el estado de tu solicitud.</p>
                    </div>
                )}
                <p className="mt-4 text-sm text-gray-500">
                    Nuestro equipo técnico se pondrá en contacto contigo pronto.
                </p>
                <div className="mt-6">
                    <Button onClick={() => window.location.href = '/'}>Volver al Inicio</Button>
                </div>
            </div>
        );
    }

    // Filtrar categorías según rol
    const userRole = user ? user.rol : formData.rol;
    const availableCategories = categories.filter(c =>
        c.activo && (c.tipo === 'global' || c.tipo === userRole)
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            {!publicMode && <h3 className="text-lg font-medium text-gray-900">Nuevo Ticket de Soporte</h3>}

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">

                {/* Datos Personales (Visibles y requeridos si no hay usuario, o pre-llenados) */}
                <div className="sm:col-span-2">
                    <h4 className="text-sm font-medium text-gray-900 border-b pb-2 mb-4">Datos del Solicitante</h4>
                </div>

                <div className="sm:col-span-1">
                    <Input
                        label="Nombre Completo"
                        name="nombre_completo"
                        required
                        value={formData.nombre_completo}
                        onChange={handleChange}
                        disabled={!!user} // Bloquear si está logueado
                    />
                </div>

                <div className="sm:col-span-1">
                    <Input
                        label={formData.rol === 'administrativo' ? "Correo Institucional" : "Correo Electrónico"}
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!!user}
                    />
                </div>

                <div className="sm:col-span-1">
                    <Input
                        label="DPI / CUI"
                        name="dpi"
                        required
                        value={formData.dpi}
                        onChange={handleChange}
                        disabled={!!user} // Bloquear si hay usuario (asumiendo que ya está en su perfil)
                    />
                </div>
                <div className="sm:col-span-1">
                    <Input
                        label="Teléfono WhatsApp"
                        name="telefono_whatsapp"
                        required
                        value={formData.telefono_whatsapp}
                        onChange={handleChange}
                        disabled={!!user}
                    />
                </div>

                {/* Detalles del Problema */}
                <div className="sm:col-span-2 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 border-b pb-2 mb-4">Detalles del Problema</h4>
                </div>

                <div className="sm:col-span-2">
                    <Input
                        label="Asunto / Título"
                        name="titulo"
                        required
                        value={formData.titulo}
                        onChange={handleChange}
                        placeholder="Ej: Proyector no enciende"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-1">Categoría</label>
                    <select
                        name="categoria_id"
                        value={formData.categoria_id}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                    >
                        <option value="" className="text-gray-500">Selecciona una categoría</option>
                        {availableCategories.map(cat => (
                            <option key={cat._id} value={cat._id} className="text-black">
                                {cat.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-1">Descripción Detallada</label>
                    <textarea
                        name="descripcion"
                        rows={5}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black placeholder-gray-500"
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Descripción detallada del problema..."
                    />
                </div>

                {(formData.rol === 'administrativo' || (user?.rol as string) === 'administrativo') && (
                    <div className="sm:col-span-2">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-900">Adjuntar Archivos (PDF, Imágenes)</label>
                            <input
                                type="file"
                                name="archivos"
                                multiple
                                accept="image/*,application/pdf"
                                onChange={(e) => setSelectedFiles(e.target.files)}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Solo disponible para personal administrativo.
                        </p>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-5">
                {!publicMode && (
                    <Button type="button" variant="secondary" className="mr-3" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" isLoading={loading} className={publicMode ? "w-full text-lg py-4" : ""}>
                    {publicMode ? 'Enviar Solicitud' : 'Crear Ticket'}
                </Button>
            </div>
        </form>
    );
}
