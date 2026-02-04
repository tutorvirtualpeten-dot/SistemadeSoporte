const Ticket = require('../models/Ticket');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const Notification = require('../models/Notification');

// @desc    Crear nuevo ticket
// @route   POST /api/tickets
// @access  Private (Docente/Administrativo)
exports.createTicket = async (req, res) => {
    try {
        const {
            titulo,
            descripcion,
            prioridad,
            categoria_id,
            datos_contacto,
            archivo_adjunto,
            tipo_usuario // Ahora viene del body si es público
        } = req.body;

        // Si hay usuario logueado, usamos sus datos. Si no, usamos lo del body
        const usuario_id = req.user ? req.user.id : null;
        const rolUsuario = req.user ? req.user.rol : (tipo_usuario || 'docente');

        // Validar datos de contacto si es público
        if (!req.user && (!datos_contacto?.nombre_completo || !datos_contacto?.email)) {
            return res.status(400).json({ message: 'Nombre y Email son requeridos para tickets públicos' });
        }

        const nuevoTicket = await Ticket.create({
            titulo,
            descripcion,
            prioridad,
            usuario_id,
            tipo_usuario: rolUsuario,
            datos_contacto,
            categoria_id,
            archivo_adjunto
        });

        // NOTIFICACIÓN POR CORREO (Usuario)
        const emailUsuario = req.user ? req.user.email : datos_contacto?.email;
        if (emailUsuario) {
            const subject = `Ticket Recibido: #${nuevoTicket.ticket_id}`;
            const text = `Hola, hemos recibido tu solicitud: "${titulo}". ID: ${nuevoTicket.ticket_id}. Puedes consultar el estado en el portal.`;
            // Call async but don't await to not block response, catch error locally
            sendEmail({ to: emailUsuario, subject, text }).catch(err => console.error('Error enviando email nuevo ticket:', err.message));
        }

        // NOTIFICACIÓN INTERNA (Admins/Agentes)
        const admins = await User.find({ rol: { $in: ['admin', 'super_admin', 'agente'] } });
        const notificacionesAdmins = admins.map(admin => ({
            recipient_id: admin._id,
            type: 'ticket_new',
            title: `Nuevo Ticket #${nuevoTicket.ticket_id}`,
            message: `${nuevoTicket.datos_contacto?.nombre_completo || 'Usuario'} ha creado: "${titulo}"`,
            link: `/portal/tickets/${nuevoTicket._id}` // Link para admin
        }));
        if (notificacionesAdmins.length > 0) {
            await Notification.insertMany(notificacionesAdmins);
        }

        res.status(201).json(nuevoTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener todos los tickets
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res) => {
    try {
        let tickets;

        // Si es admin, super_admin o agente, ve todos
        if (req.user.rol === 'admin' || req.user.rol === 'super_admin' || req.user.rol === 'agente') {
            tickets = await Ticket.find()
                .populate('usuario_id', 'nombre email')
                .populate('agente_id', 'nombre email')
                .populate('categoria_id', 'nombre')
                .sort({ fecha_creacion: -1 });
        } else {
            // Si es usuario, solo ve los suyos
            tickets = await Ticket.find({ usuario_id: req.user.id })
                .populate('categoria_id', 'nombre')
                .sort({ fecha_creacion: -1 });
        }

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener un ticket por ID
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('usuario_id', 'nombre email')
            .populate('agente_id', 'nombre email')
            .populate('categoria_id', 'nombre');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket no encontrado' });
        }

        // Verificar permisos: dueño, admin o agente
        // 1. Si es admin, super_admin o agente, TIENE permiso siempre.
        // 2. Si NO es admin/agente, debe verificar si es el dueño.
        // 3. Si el ticket no tiene usuario (es público) y el que consulta NO es admin, NO tiene permiso.

        const isAdminOrAgent = req.user.rol === 'admin' || req.user.rol === 'super_admin' || req.user.rol === 'agente';

        if (!isAdminOrAgent) {
            // Si el ticket no tiene dueño (público) y no soy admin, no puedo verlo (o quizás sí si tuviera un token especial, pero por ahora no)
            if (!ticket.usuario_id) {
                return res.status(401).json({ message: 'No autorizado para ver este ticket público' });
            }

            // Si tiene dueño, debe coincidir con el usuario logueado
            if (ticket.usuario_id._id.toString() !== req.user.id) {
                return res.status(401).json({ message: 'No autorizado' });
            }
        }

        res.json(ticket);
    } catch (error) {
        console.error(error); // Log error for debugging
        res.status(500).json({ message: error.message });
    }
};

// @desc    Actualizar ticket
// @route   PUT /api/tickets/:id
// @access  Private (Agente/Admin)
exports.updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket no encontrado' });
        }

        // Verificar permisos
        const isOwner = ticket.usuario_id && ticket.usuario_id.toString() === req.user.id;
        const isAdminOrAgent = req.user.rol === 'admin' || req.user.rol === 'super_admin' || req.user.rol === 'agente';

        if (!isOwner && !isAdminOrAgent) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        let updateData = req.body;

        // Si es dueño pero NO admin/agente, restringir campos
        if (isOwner && !isAdminOrAgent) {
            const { titulo, descripcion, datos_contacto, archivo_adjunto, categoria_id } = req.body;
            updateData = { titulo, descripcion, datos_contacto, archivo_adjunto, categoria_id };
            // Forzar actualización de fecha
            updateData.fecha_actualizacion = Date.now();
        }

        const actualizado = await Ticket.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('usuario_id', 'email nombre').populate('agente_id', 'email nombre');

        // NOTIFICACIONES
        // 1. Cambio de Estado -> Notificar al Dueño
        if (req.body.estado && req.body.estado !== ticket.estado) {
            const distEmail = actualizado.usuario_id?.email || actualizado.datos_contacto?.email;
            if (distEmail) {
                sendEmail({
                    to: distEmail,
                    subject: `Actualización de Ticket #${actualizado.ticket_id}`,
                    text: `El estado de tu ticket ha cambiado a: ${actualizado.estado.toUpperCase()}.`
                }).catch(err => console.error('Error enviando email notificación usuario:', err.message));
            }

            // Notifiación Interna al Usuario (si no fue él quien lo cambió)
            if (actualizado.usuario_id && req.user.id !== actualizado.usuario_id._id.toString()) {
                await Notification.create({
                    recipient_id: actualizado.usuario_id._id,
                    type: 'ticket_update',
                    title: `Actualización #${actualizado.ticket_id}`,
                    message: `Tu ticket ha cambiado a: ${actualizado.estado.toUpperCase()}`,
                    link: `/portal/tickets/${actualizado._id}`
                });
            }
        }

        // 2. Asignación de Agente -> Notificar al Agente
        // Detectar si cambió el agente (comparando IDs)
        const oldAgentId = ticket.agente_id ? ticket.agente_id.toString() : null;
        const newAgentId = actualizado.agente_id ? actualizado.agente_id._id.toString() : null;

        if (newAgentId && newAgentId !== oldAgentId) {
            if (actualizado.agente_id && actualizado.agente_id.email) {
                sendEmail({
                    to: actualizado.agente_id.email,
                    subject: `Nuevo Ticket Asignado: #${actualizado.ticket_id}`,
                    text: `Se te ha asignado el ticket "${actualizado.titulo}". Por favor revísalo en el panel.`
                }).catch(err => console.error('Error enviando email notificación agente:', err.message));
            }

            // Notificación Interna al Nuevo Agente
            await Notification.create({
                recipient_id: newAgentId,
                type: 'ticket_assigned',
                title: `Ticket Asignado #${actualizado.ticket_id}`,
                message: `Se te ha asignado el ticket: "${actualizado.titulo}"`,
                link: `/portal/tickets/${actualizado._id}`
            });
        }

        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener estado de ticket (Público)
// @route   GET /api/tickets/status/:id
// @access  Public
exports.getTicketStatus = async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        if (isNaN(ticketId)) {
            return res.status(400).json({ message: 'El ID debe ser numérico' });
        }

        const ticket = await Ticket.findOne({ ticket_id: ticketId })
            .select('ticket_id titulo estado prioridad fecha_creacion datos_contacto.nombre_completo')
            .populate('agente_id', 'nombre');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket no encontrado' });
        }

        if (ticket.estado === 'cerrado') {
            return res.status(403).json({ message: 'Este caso ya ha sido cerrado definitivamente.' });
        }

        // Obtener comentarios también (Solo los NO internos)
        const Comment = require('../models/Comment');
        const comments = await Comment.find({
            ticket_id: ticket._id,
            es_interno: { $ne: true } // Filtrar internos
        }).sort({ fecha: 1 }).populate('usuario_id', 'nombre');

        res.json({ ...ticket.toObject(), comments });
    } catch (error) {
        res.status(500).json({ message: 'Error al consultar ticket.' });
    }
};

// @desc    Agregar comentario público
// @route   POST /api/tickets/public/comment/:id
// @access  Public
exports.addPublicComment = async (req, res) => {
    try {
        const { texto } = req.body;
        const ticketId = parseInt(req.params.id);

        const ticket = await Ticket.findOne({ ticket_id: ticketId });
        if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });

        if (ticket.estado === 'cerrado') {
            return res.status(400).json({ message: 'No se puede comentar en un ticket cerrado.' });
        }

        const Comment = require('../models/Comment');
        const comment = await Comment.create({
            ticket_id: ticket._id,
            mensaje: texto, // Usar 'mensaje' como en el modelo
            es_interno: false,
            // Sin usuario_id porque es público
        });

        // Notificar al Agente o Admin
        const Notification = require('../models/Notification');
        // ... Lógica de notificación simplificada ...

        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Calificar y Cerrar Ticket
// @route   PUT /api/tickets/public/rate/:id
// @access  Public
exports.rateTicket = async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        const ticketId = parseInt(req.params.id);

        const ticket = await Ticket.findOne({ ticket_id: ticketId });
        if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });

        if (ticket.estado !== 'resuelto') {
            return res.status(400).json({ message: 'Solo se pueden calificar tickets resueltos.' });
        }

        ticket.calificacion = rating;
        ticket.mensaje_resolucion = feedback;
        ticket.estado = 'cerrado'; // Cierre definitivo
        await ticket.save();

        res.json({ message: 'Ticket calificado y cerrado correctamente.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket no encontrado' });
        }

        // Solo admin borra
        if (req.user.rol !== 'admin' && req.user.rol !== 'super_admin') {
            return res.status(401).json({ message: 'No autorizado' });
        }

        await ticket.deleteOne();
        res.json({ message: 'Ticket eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
