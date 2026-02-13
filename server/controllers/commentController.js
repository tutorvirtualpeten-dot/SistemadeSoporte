const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
const User = require('../models/User'); // Importado
const notifyUser = require('../utils/notifyUser');
const sendEmail = require('../utils/emailService');

// @desc    Agregar comentario
// @route   POST /api/comments
// @access  Private
exports.addComment = async (req, res) => {
    try {
        const { ticket_id, mensaje, es_interno } = req.body;

        const ticket = await Ticket.findById(ticket_id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket no encontrado' });
        }

        // Validación seguridad: Solo participantes o admin pueden comentar
        const userId = req.user.id;
        // Uso de ?.toString() para evitar crash si es null
        const isOwner = ticket.usuario_id?.toString() === userId;
        const isAgent = ticket.agente_id?.toString() === userId;
        const isAdmin = req.user.rol === 'admin' || req.user.rol === 'super_admin';

        if (!isOwner && !isAgent && !isAdmin) {
            return res.status(401).json({ message: 'No autorizado para comentar en este ticket' });
        }

        const comentario = await Comment.create({
            ticket_id,
            usuario_id: req.user.id,
            mensaje,
            es_interno: es_interno || false
        });

        // Actualizar fecha del ticket
        ticket.fecha_actualizacion = Date.now();
        await ticket.save();

        const comentarioFull = await Comment.findById(comentario._id).populate('usuario_id', 'nombre rol');

        // --- NOTIFICACIONES ---
        try {
            // Determinar destinatarios
            // Si el que comenta NO es el dueño, notificar al dueño
            if (ticket.usuario_id && req.user.id !== ticket.usuario_id.toString()) {
                const owner = await User.findById(ticket.usuario_id);
                if (owner) {
                    // 1. In-App
                    await notifyUser(
                        owner._id,
                        'NEW_COMMENT',
                        `Nueva respuesta en Ticket #${ticket.ticket_id || ticket._id}`,
                        `${req.user.nombre}: ${mensaje.substring(0, 50)}${mensaje.length > 50 ? '...' : ''}`,
                        `/portal/tickets/${ticket._id}`
                    );

                    // 2. Email
                    if (owner.email && !es_interno) {
                        await sendEmail({
                            to: owner.email,
                            subject: `Nueva respuesta en Ticket #${ticket.ticket_id || 'Soporte'}`,
                            text: `Hola ${owner.nombre},\n\n${req.user.nombre} ha respondido a tu ticket:\n"${mensaje}"\n\nVer ticket: /portal/tickets/${ticket._id}`,
                            html: `<p>Hola <strong>${owner.nombre}</strong>,</p>
                                   <p>Has recibido una nueva respuesta en tu ticket.</p>
                                   <blockquote>${mensaje}</blockquote>
                                   <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/portal/tickets/${ticket._id}">Ver Ticket</a>`
                        });
                    }
                }
            }

            // Si el que comenta NO es el agente asignado, notificar al agente
            if (ticket.agente_id && req.user.id !== ticket.agente_id.toString()) {
                const agent = await User.findById(ticket.agente_id);
                if (agent) {
                    // 1. In-App
                    await notifyUser(
                        agent._id,
                        'NEW_COMMENT',
                        `Nuevo comentario en Ticket #${ticket.ticket_id || ticket._id}`,
                        `${req.user.nombre}: ${mensaje.substring(0, 50)}...`,
                        `/portal/tickets/${ticket._id}`
                    );

                    // 2. Email
                    if (agent.email) {
                        await sendEmail({
                            to: agent.email,
                            subject: `Nuevo comentario en Ticket #${ticket.ticket_id || 'Soporte'}`,
                            text: `Hola ${agent.nombre},\n\nNuevo comentario en el ticket asignado a ti:\n"${mensaje}"`,
                            html: `<p>Hola <strong>${agent.nombre}</strong>,</p>
                                   <p>Nuevo comentario en el ticket #${ticket.ticket_id || ticket._id}:</p>
                                   <blockquote>${mensaje}</blockquote>
                                   <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/portal/tickets/${ticket._id}">Ver Ticket</a>`
                        });
                    }
                }
            }

        } catch (notifError) {
            console.error('Error enviando notificaciones de comentario:', notifError);
            // No fallar el request principal por esto
        }

        res.status(201).json(comentarioFull);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener comentarios de un ticket
// @route   GET /api/comments/:ticketId
// @access  Private
exports.getCommentsByTicket = async (req, res) => {
    try {
        const comments = await Comment.find({ ticket_id: req.params.ticketId })
            .populate('usuario_id', 'nombre rol')
            .sort({ fecha: 1 });

        // Filtrar internos si es usuario final
        const filteredComments = comments.filter(c => {
            if (c.es_interno) {
                return req.user.rol === 'admin' || req.user.rol === 'agente' || req.user.rol === 'super_admin';
            }
            return true;
        });

        res.json(filteredComments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
