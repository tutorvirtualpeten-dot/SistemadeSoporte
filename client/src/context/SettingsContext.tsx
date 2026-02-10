'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';

interface Settings {
    nombre_app?: string;
    logo_url?: string;
    smtp_config?: any;
    modulos?: { [key: string]: string[] };
}

interface SettingsContextType {
    settings: Settings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>({});
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            setSettings(data);

            // Dynamic Favicon Update
            if (data.logo_url) {
                const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
                link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                link.href = data.logo_url;
                document.getElementsByTagName('head')[0].appendChild(link);
            }

            // Dynamic Title Update (Optional, can be removed if not desired)
            if (data.nombre_app) {
                document.title = data.nombre_app;
            }

        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
