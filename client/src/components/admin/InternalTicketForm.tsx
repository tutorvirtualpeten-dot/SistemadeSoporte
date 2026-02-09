'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Search, User as UserIcon } from 'lucide-react';

interface Category {
    _id: string;
    nombre: string;
}

interface TicketSource {
    _id: string;
    nombre: string;
}

interface ServiceType {
    _id: string;
    nombre: string;
    descripcion?: string;
}

interface User {
    _id: string;
    nombre: string;
    email: string;
    rol: string;
}

export default function InternalTicketForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Catalogs
    const [categories, setCategories] = useState<Category[]>([]);
    const [sources, setSources] = useState<TicketSource[]>([]);
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        prioridad: 'media',
        categoria_id: '',
        source_id: '',
        service_type_id: '',
        estado: 'abierto',
        // Internal fields
        solicitante_id: '',
        tipo_usuario: 'docente', // Default for guest
        datos_contacto: {
            nombre_completo: '',
            dni: '', // Changed dpi to dni/dpi generically in UI but keeping structure
            dpi: '',
            telefono: '',
            email: ''
        }
    });

    // User Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [mode, setMode] = useState<'registered' | 'guest'>('registered');

    useEffect(() => {
        fetchCatalogs();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length > 2 && mode === 'registered') {
                searchUsers();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, mode]);

    const fetchCatalogs = async () => {
        try {
            const [cats, srcs, svcs] = await Promise.all([
                api.get('/categories'),
                api.get('/ticket-sources'),
                api.get('/service-types')
            ]);
            setCategories(cats.data);
            setSources(srcs.data.filter((s: any) => s.activo));
            setServiceTypes(svcs.data.filter((s: any) => s.activo));
        } catch (error) {
            console.error('Error loading catalogs', error);
        }
    };

    const searchUsers = async () => {
        setIsSearching(true);
        try {
            const { data } = await api.get(`/admin/users/search?query=${encodeURIComponent(searchTerm)}`);
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching users', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        setFormData({ ...formData, solicitante_id: user._id });
        setSearchTerm('');
        setSearchResults([]);
    };

    const clearSelectedUser = () => {
        setSelectedUser(null);
        setFormData({ ...formData, solicitante_id: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare payload
            const payload = {
                ...formData,
                datos_contacto: mode === 'guest' ? formData.datos_contacto : undefined
            };

            await api.post('/tickets', payload);
            router.push('/admin/tickets');
            router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al crear ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow">

            {/* Sección Solicitante */}
            <div className="border-b pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                    Datos del Solicitante
                </h3>

                <div className="flex gap-4 mb-4">
                    <button
                        type="button"
                        onClick={() => setMode('registered')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${mode === 'registered' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Usuario Registrado
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('guest')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${mode === 'guest' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Invitado / Externo
                    </button>
                </div>

                {mode === 'registered' ? (
                    <div className="relative">
                        {!selectedUser ? (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o email..."
                                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {searchResults.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border mt-1">
                                        {searchResults.map((user) => (
                                            <li
                                                key={user._id}
                                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 text-gray-900"
                                                onClick={() => handleUserSelect(user)}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.nombre}</span>
                                                    <span className="text-gray-500 text-xs">{user.email} - {user.rol}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200">
                                <div>
                                    <p className="font-medium text-blue-900">{selectedUser.nombre}</p>
                                    <p className="text-sm text-blue-700">{selectedUser.email}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={clearSelectedUser}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Cambiar
                                </button>
                            </div>
                        )}
                        <input type="hidden" required={mode === 'registered'} value={formData.solicitante_id} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input
                                type="text"
                                required={mode === 'guest'}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                                value={formData.datos_contacto.nombre_completo}
                                onChange={(e) => setFormData({ ...formData, datos_contacto: { ...formData.datos_contacto, nombre_completo: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email (Opcional)</label>
                            <input
                                type="email"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                                value={formData.datos_contacto.email}
                                onChange={(e) => setFormData({ ...formData, datos_contacto: { ...formData.datos_contacto, email: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                                value={formData.datos_contacto.telefono}
                                onChange={(e) => setFormData({ ...formData, datos_contacto: { ...formData.datos_contacto, telefono: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">DPI / Identificación</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                                value={formData.datos_contacto.dpi}
                                onChange={(e) => setFormData({ ...formData, datos_contacto: { ...formData.datos_contacto, dpi: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo de Usuario</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                                value={formData.tipo_usuario}
                                onChange={(e) => setFormData({ ...formData, tipo_usuario: e.target.value })}
                            >
                                <option value="docente">Docente</option>
                                <option value="administrativo">Administrativo</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Detalles del Ticket */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles de la Solicitud</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Título / Asunto</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Descripción Detallada</label>
                        <textarea
                            required
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Categoría</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                            value={formData.categoria_id}
                            onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                        >
                            <option value="">Seleccionar Categoría</option>
                            {categories.map(c => (
                                <option key={c._id} value={c._id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Servicio</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                            value={formData.service_type_id}
                            onChange={(e) => setFormData({ ...formData, service_type_id: e.target.value })}
                        >
                            <option value="">Seleccionar Tipo Servicio</option>
                            {serviceTypes.map(s => (
                                <option key={s._id} value={s._id}>{s.nombre}{s.descripcion ? ` - ${s.descripcion}` : ''}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Medio de Recepción</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                            value={formData.source_id}
                            onChange={(e) => setFormData({ ...formData, source_id: e.target.value })}
                        >
                            <option value="">Seleccionar Medio</option>
                            {sources.map(s => (
                                <option key={s._id} value={s._id}>{s.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                            value={formData.prioridad}
                            onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                        >
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                            <option value="critica">Crítica</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estado Inicial</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black px-3 py-2 border"
                            value={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        >
                            <option value="abierto">Abierto</option>
                            <option value="en_progreso">En Progreso</option>
                            <option value="resuelto">Resuelto</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-5">
                <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {loading ? 'Creando...' : 'Crear Ticket'}
                </button>
            </div>
        </form>
    );
}
