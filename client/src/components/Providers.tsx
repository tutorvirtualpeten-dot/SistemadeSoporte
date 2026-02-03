'use client';

import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SettingsProvider>
                {children}
            </SettingsProvider>
        </AuthProvider>
    );
}
