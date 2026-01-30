const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');

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
        if (
            ticket.usuario_id.toString() !== req.user.id &&
            ticket.agente_id?.toString() !== req.user.id &&
            req.user.rol !== 'admin'
        ) {
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
                return req.user.rol === 'admin' || req.user.rol === 'agente';
            }
            return true;
        });

        res.json(filteredComments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
