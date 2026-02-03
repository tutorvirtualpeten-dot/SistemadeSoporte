'use client';

import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { NotificationProvider } from '@/context/NotificationContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SettingsProvider>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}
