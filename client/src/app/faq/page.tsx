'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, HelpCircle } from 'lucide-react';

interface FAQ {
    _id: string;
    pregunta: string;
    respuesta: string;
    categoria: string;
}

export default function PublicFAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const { data } = await api.get('/faqs');
                setFaqs(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchFAQs();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <Link href="/">
                            <Button variant="outline" className="mr-4 text-gray-600 border-gray-300">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Regresar
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                            <HelpCircle className="h-8 w-8 text-blue-600 mr-3" />
                            Preguntas Frecuentes
                        </h1>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Cargando contenido...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {faqs.length > 0 ? (
                            faqs.map((faq) => (
                                <div key={faq._id} className="bg-white shadow overflow-hidden rounded-lg hover:shadow-md transition-shadow">
                                    <div className="px-6 py-5">
                                        <div className="flex items-center mb-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {faq.categoria}
                                            </span>
                                        </div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                                            {faq.pregunta}
                                        </h3>
                                        <div className="text-base text-gray-500 whitespace-pre-line">
                                            {faq.respuesta}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <p className="text-gray-500">No hay preguntas frecuentes publicadas por el momento.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
