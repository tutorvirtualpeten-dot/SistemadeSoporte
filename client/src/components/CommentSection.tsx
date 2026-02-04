'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

interface Comment {
    _id: string;
    usuario_id: { _id: string; nombre: string; rol: string };
    mensaje: string;
    es_interno: boolean;
    fecha: string;
}

export default function CommentSection({ ticketId }: { ticketId: string }) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [isInternal, setIsInternal] = useState(false);

    const fetchComments = async () => {
        try {
            const { data } = await api.get(`/comments/${ticketId}`);
            setComments(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [ticketId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            await api.post('/comments', {
                ticket_id: ticketId,
                mensaje: newComment,
                es_interno: isInternal
            });
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error(error);
            // @ts-ignore
            const msg = error.response?.data?.message || 'Error enviando comentario';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Conversación</h3>

            <div className="flow-root mb-6">
                <ul role="list" className="-mb-8">
                    {comments.map((comment, commentIdx) => (
                        <li key={comment._id}>
                            <div className="relative pb-8">
                                {commentIdx !== comments.length - 1 ? (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${comment.es_interno ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`}>
                                        <span className="text-white text-xs font-bold">
                                            {comment.usuario_id.nombre.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm text-gray-900">
                                                <span className="font-medium text-gray-900">{comment.usuario_id.nombre}</span>
                                                {comment.es_interno && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Nota Interna</span>}
                                            </p>
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                            <time dateTime={comment.fecha}>{new Date(comment.fecha).toLocaleString()}</time>
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-11 mt-1 text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200">
                                    <p>{comment.mensaje}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    <label htmlFor="comment" className="sr-only">Agrega un comentario</label>
                    <textarea
                        rows={3}
                        name="comment"
                        id="comment"
                        className="block w-full py-3 px-4 resize-none border-0 focus:ring-0 sm:text-sm text-gray-900 placeholder-gray-500"
                        placeholder="Escribe un mensaje..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />

                    <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center">
                            {(user?.rol === 'admin' || user?.rol === 'agente') && (
                                <label className="flex items-center space-x-2 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={isInternal}
                                        onChange={(e) => setIsInternal(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>Nota interna (Privada)</span>
                                </label>
                            )}
                        </div>
                        <Button type="submit" isLoading={loading} disabled={!newComment.trim()}>
                            Enviar
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
