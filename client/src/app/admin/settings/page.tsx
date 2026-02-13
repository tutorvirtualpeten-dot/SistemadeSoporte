'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import LogoImage from '@/components/LogoImage';
import SecurityModal from '@/components/SecurityModal';
import ModulePermissions from '@/components/admin/ModulePermissions';

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

    useEffect(() => {
        api.get('/settings').then(({ data }) => setSettings(data)).catch(console.error);
    }, []);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSecurityModalOpen(true);
    };

    const saveSettings = async () => {
        setLoading(true);
        try {
            await api.put('/settings', settings);
            // Reload to apply changes (logo context)
            window.location.reload();
        } catch (error) {
            alert('Error guardando configuración');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Configuración General</h1>

            <form onSubmit={handleFormSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                <Input
                    label="Nombre de la Aplicación"
                    value={settings.nombre_app || ''}
                    onChange={(e) => setSettings({ ...settings, nombre_app: e.target.value })}
                />

                <Input
                    label="URL del Logo"
                    value={settings.logo_url || ''}
                    onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                />

                {settings.logo_url && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Vista Previa:</p>
                        <div className="p-2 border rounded bg-gray-50 inline-block">
                            <LogoImage
                                src={settings.logo_url}
                                className="h-16 w-auto object-contain"
                            />
                        </div>
                    </div>
                )}

                <div className="border-t pt-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración de SLA (Horas)</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Input
                            label="Prioridad CRÍTICA"
                            type="number"
                            value={settings.sla?.critica || 4}
                            onChange={(e) => setSettings({ ...settings, sla: { ...settings.sla, critica: parseInt(e.target.value) } })}
                        />
                        <Input
                            label="Prioridad ALTA"
                            type="number"
                            value={settings.sla?.alta || 24}
                            onChange={(e) => setSettings({ ...settings, sla: { ...settings.sla, alta: parseInt(e.target.value) } })}
                        />
                        <Input
                            label="Prioridad MEDIA"
                            type="number"
                            value={settings.sla?.media || 72}
                            onChange={(e) => setSettings({ ...settings, sla: { ...settings.sla, media: parseInt(e.target.value) } })}
                        />
                        <Input
                            label="Prioridad BAJA"
                            type="number"
                            value={settings.sla?.baja || 168}
                            onChange={(e) => setSettings({ ...settings, sla: { ...settings.sla, baja: parseInt(e.target.value) } })}
                        />
                    </div>
                </div>

                <div className="flex justify-end items-center mt-6">
                    <Button type="submit" isLoading={loading}>Guardar Cambios</Button>
                </div>
            </form>

            <ModulePermissions />

            <SecurityModal
                isOpen={isSecurityModalOpen}
                onClose={() => setIsSecurityModalOpen(false)}
                onConfirm={saveSettings}
                title="Guardar Configuración"
                description="Estás a punto de modificar la configuración global del sistema. Esta acción requiere confirmación."
            />
        </div>
    );
}
