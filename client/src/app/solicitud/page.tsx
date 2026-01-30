'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TicketForm from '@/components/TicketForm';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function RequestContent() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'docente'; // Default to docente

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700 transition">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Volver al inicio
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 capitalize">
                        Soporte {role}
                    </h1>
                </div>

                <TicketForm publicMode={true} initialRole={role} />
            </div>
        </div>
    );
}

export default function RequestPage() {
    return (
        <Suspense fallback={<div>Cargando formulario...</div>}>
            <RequestContent />
        </Suspense>
    );
}
