'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface FAQ {
    _id: string;
    pregunta: string;
    respuesta: string;
    categoria: string;
}

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const { data } = await api.get('/faqs');
                setFaqs(data);
            } catch (error) {
                console.error(error);
                setError('No se pudieron cargar las preguntas frecuentes. Por favor intente más tarde.');
            } finally {
                setLoading(false);
            }
        };
        fetchFAQs();
    }, []);

    if (loading) return <div>Cargando FAQs...</div>;

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas Frecuentes</h2>
            <div className="space-y-4">
                {faqs.map((faq) => (
                    <div key={faq._id} className="bg-white shadow overflow-hidden rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900">{faq.pregunta}</h3>
                        <p className="mt-2 text-gray-600">{faq.respuesta}</p>
                        <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {faq.categoria}
                        </span>
                    </div>
                ))}
                {faqs.length === 0 && <p className="text-gray-500">No hay preguntas frecuentes aún.</p>}
            </div>
        </div>
    );
}
