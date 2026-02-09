'use client';

import TicketSourceManager from '@/components/admin/TicketSourceManager';
import ServiceTypeManager from '@/components/admin/ServiceTypeManager';

export default function CatalogSettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración de Catálogos</h1>
                <p className="text-gray-500">Administra las listas desplegables utilizadas en los tickets.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <TicketSourceManager />
                <ServiceTypeManager />
            </div>
        </div>
    );
}
