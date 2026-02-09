'use client';

import InternalTicketForm from '@/components/admin/InternalTicketForm';

export default function NewTicketPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Ticket Interno</h1>
            <InternalTicketForm />
        </div>
    );
}
