import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import api from '@/lib/api';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Definición de tipos para los módulos
// Debe coincidir con el backend Setting.js
interface ModuloConfig {
    [key: string]: string[]; // key: modulo, value: array de roles permitidos
}

export default function ModulePermissions() {
    const { settings, updateSettings, refreshSettings } = useSettings();
    const [modulos, setModulos] = useState<ModuloConfig>({});
    const [loading, setLoading] = useState(false);

    // Módulos disponibles para configurar
    const availableModules = [
        { id: 'tickets', label: 'Tickets' },
        { id: 'catalogs', label: 'Catálogos' },
        { id: 'responses', label: 'Respuestas Rápidas' },
        { id: 'categories', label: 'Categorías' },
        { id: 'faqs', label: 'FAQs' },
        // 'users', 'audit', 'settings' suelen ser solo admin/super, pero podrían abrirse si se desea
    ];

    useEffect(() => {
        if (settings.modulos) {
            setModulos(settings.modulos);
        }
    }, [settings]);

    const handleToggle = (moduleId: string, role: string) => {
        setModulos(prev => {
            const currentRoles = prev[moduleId] || [];
            const hasRole = currentRoles.includes(role);

            let newRoles;
            if (hasRole) {
                newRoles = currentRoles.filter(r => r !== role);
            } else {
                newRoles = [...currentRoles, role];
            }

            return {
                ...prev,
                [moduleId]: newRoles
            };
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Actualizar vía settings endpoint
            // Nota: backend espera el objeto completo de settings o patch
            await api.put('/settings', {
                ...settings, // Mantener otros settings si el endpoint reemplaza todo
                modulos
            });
            await refreshSettings(); // Recargar contexto
            alert('Permisos actualizados correctamente');
        } catch (error) {
            console.error(error);
            alert('Error al guardar permisos');
        } finally {
            setLoading(false);
        }
    };

    if (!settings.modulos) return <div>Cargando configuración...</div>;

    return (
        <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Control de Acceso a Módulos</h3>
            <p className="text-sm text-gray-500 mb-6">
                Seleccione qué roles tienen acceso a cada módulo. El <strong>Super Admin</strong> siempre tiene acceso total.
            </p>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Agente</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {availableModules.map((module) => (
                            <tr key={module.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {module.label}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <input
                                        type="checkbox"
                                        checked={modulos[module.id]?.includes('admin')}
                                        onChange={() => handleToggle(module.id, 'admin')}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <input
                                        type="checkbox"
                                        checked={modulos[module.id]?.includes('agente')}
                                        onChange={() => handleToggle(module.id, 'agente')}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-end">
                <Button onClick={handleSave} isLoading={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Permisos
                </Button>
            </div>
        </div>
    );
}
