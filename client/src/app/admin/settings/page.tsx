'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/settings').then(({ data }) => setSettings(data)).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/settings', settings);
            alert('Configuración guardada');
        } catch (error) {
            alert('Error guardando configuración');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Configuración del Sistema</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                            <img
                                src={settings.logo_url}
                                alt="Logo Preview"
                                className="h-16 w-auto object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    </div>
                )}

                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-gray-900">Configuración SMTP (Correo)</h3>
                        <div className="space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => setSettings({
                                    ...settings,
                                    smtp_config: { ...settings.smtp_config, host: 'smtp.gmail.com', port: 587 }
                                })}
                            >
                                Usar Gmail
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => setSettings({
                                    ...settings,
                                    smtp_config: { ...settings.smtp_config, host: 'smtp.office365.com', port: 587 }
                                })}
                            >
                                Usar Outlook
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Host"
                            value={settings.smtp_config?.host || ''}
                            onChange={(e) => setSettings({
                                ...settings,
                                smtp_config: { ...settings.smtp_config, host: e.target.value }
                            })}
                        />
                        <Input
                            label="Puerto"
                            type="number"
                            value={settings.smtp_config?.port || ''}
                            onChange={(e) => setSettings({
                                ...settings,
                                smtp_config: { ...settings.smtp_config, port: Number(e.target.value) }
                            })}
                        />
                        <Input
                            label="Usuario"
                            value={settings.smtp_config?.user || ''}
                            onChange={(e) => setSettings({
                                ...settings,
                                smtp_config: { ...settings.smtp_config, user: e.target.value }
                            })}
                        />
                        <Input
                            label="Contraseña (o App Password)"
                            type="password"
                            placeholder="Tu contraseña o app password de 16 caracteres"
                            value={settings.smtp_config?.pass || ''}
                            onChange={(e) => setSettings({
                                ...settings,
                                smtp_config: { ...settings.smtp_config, pass: e.target.value }
                            })}
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={async () => {
                            if (!confirm('Esto enviará un correo de prueba a tu email. ¿Deseas continuar?')) return;
                            try {
                                alert('Enviando correo de prueba...');
                                await api.post('/settings/test-email');
                                alert('¡Correo enviado con éxito! Revisa tu bandeja de entrada.');
                            } catch (error: any) {
                                alert('Error al enviar correo: ' + (error.response?.data?.message || 'Error desconocido'));
                            }
                        }}
                    >
                        Probar Conexión
                    </Button>
                    <Button type="submit" isLoading={loading}>Guardar Cambios</Button>
                </div>
            </form>
        </div>
    );
}
