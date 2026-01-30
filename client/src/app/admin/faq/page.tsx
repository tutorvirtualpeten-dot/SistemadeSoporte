'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2 } from 'lucide-react';

interface FAQ {
    _id: string;
    pregunta: string;
    respuesta: string;
    categoria: string;
}

export default function AdminFAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [newFAQ, setNewFAQ] = useState({ pregunta: '', respuesta: '', categoria: '' });

    const fetchFAQs = () => api.get('/faqs/admin').then(({ data }) => setFaqs(data));

    useEffect(() => {
        fetchFAQs();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/faqs/admin', newFAQ);
            setNewFAQ({ pregunta: '', respuesta: '', categoria: '' });
            fetchFAQs();
        } catch (error) {
            alert('Error creando FAQ');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar?')) return;
        try {
            await api.delete(`/faqs/admin/${id}`);
            fetchFAQs();
        } catch (error) {
            alert('Error eliminando FAQ');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión de FAQ</h2>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h3 className="text-lg font-medium mb-4">Nueva Pregunta</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input
                        placeholder="Pregunta"
                        value={newFAQ.pregunta}
                        onChange={(e) => setNewFAQ({ ...newFAQ, pregunta: e.target.value })}
                        required
                    />
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="Respuesta"
                        rows={3}
                        value={newFAQ.respuesta}
                        onChange={(e) => setNewFAQ({ ...newFAQ, respuesta: e.target.value })}
                        required
                    />
                    <Input
                        placeholder="Categoría (Ej: General, Pagos)"
                        value={newFAQ.categoria}
                        onChange={(e) => setNewFAQ({ ...newFAQ, categoria: e.target.value })}
                        required
                    />
                    <Button type="submit">Agregar FAQ</Button>
                </form>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <ul className="divide-y divide-gray-200">
                    {faqs.map((faq) => (
                        <li key={faq._id} className="p-4 flex justify-between items-start">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">{faq.pregunta}</h4>
                                <p className="mt-1 text-sm text-gray-600">{faq.respuesta}</p>
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-2 inline-block">{faq.categoria}</span>
                            </div>
                            <button onClick={() => handleDelete(faq._id)} className="text-red-600 hover:text-red-900">
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
