import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { History, User, Tag, ArrowRight, UserPlus, AlertTriangle } from 'lucide-react';

interface HistoryEvent {
    _id: string;
    usuario_id: { _id: string; nombre: string; email: string };
    accion: string;
    detalles: {
        anterior?: any;
        nuevo?: any;
        descripcion?: string;
    };
    fecha: string;
}

export default function TicketHistory({ ticketId }: { ticketId: string }) {
    const [history, setHistory] = useState<HistoryEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/tickets/${ticketId}/history`);
                setHistory(res.data);
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };

        if (ticketId) {
            fetchHistory();
        }
    }, [ticketId]);

    const getIcon = (action: string) => {
        switch (action) {
            case 'CREACION': return <UserPlus className="h-4 w-4 text-green-500" />;
            case 'CAMBIO_ESTADO': return <Tag className="h-4 w-4 text-blue-500" />;
            case 'ASIGNACION': return <User className="h-4 w-4 text-purple-500" />;
            case 'CAMBIO_PRIORIDAD': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            default: return <History className="h-4 w-4 text-gray-500" />;
        }
    };

    if (loading) return <div className="text-center py-4 text-gray-500">Cargando historial...</div>;
    if (history.length === 0) return <div className="text-center py-4 text-gray-500 text-sm">No hay actividad registrada.</div>;

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {history.map((event, eventIdx) => (
                    <li key={event._id}>
                        <div className="relative pb-8">
                            {eventIdx !== history.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center ring-8 ring-white">
                                        {getIcon(event.accion)}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            <span className="font-medium text-gray-900">{event.usuario_id?.nombre || 'Sistema'}</span>{' '}
                                            {event.detalles?.descripcion || event.accion}
                                        </p>
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                        <time dateTime={event.fecha}>{format(new Date(event.fecha), "d MMM, HH:mm", { locale: es })}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
