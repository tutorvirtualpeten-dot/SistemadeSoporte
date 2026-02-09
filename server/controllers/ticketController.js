const Ticket = require('../models/Ticket');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const Notification = require('../models/Notification');
const notifyUser = require('../utils/notifyUser');
const logActivity = require('../utils/activityLogger');
const TicketHistory = require('../models/TicketHistory');

/**
 * @desc    Crear un nuevo ticket de soporte
 * @route   POST /api/tickets
 * @access  Private (Docente/Administrativo) o Public (si no auth)
 * @param   {string} titulo - Título breve del problema
 * @param   {string} descripcion - Descripción detallada
 * @param   {string} categoria_id - ID de la categoría del problema
 * @param   {string} prioridad - Nivel de urgencia (baja, media, alta)
 */
// @desc    Crear nuevo ticket
// @route   POST /api/tickets
// @access  Private (Docente/Administrativo)
exports.createTicket = async (req, res) => {
    try {
        console.log('Body:', req.body);

        console.log('🔐 User authenticated:', !!req.user);
        console.log('👤 User info:', req.user ? { id: req.user.id, rol: req.user.rol, email: req.user.email } : 'None');

        const {
            titulo,
            descripcion,
            prioridad,
            categoria_id,
            tipo_usuario,
            // Nuevos campos para tickets internos
            source_id,
            service_type_id,
            estado, // Permitir definir estado inicial (ej. resuelto)
            solicitante_id, // ID del usuario si es un ticket interno para un usuario existente
            datos_contacto: datosContactoBody // Datos de contacto si es para un invitado
        } = req.body;

        // Determinar quién está creando el ticket
        const isAgentOrAdmin = req.user && ['admin', 'super_admin', 'agente'].includes(req.user.rol);
        const creado_por_id = isAgentOrAdmin ? req.user.id : null;

        let usuario_id = null;
        let rolUsuario = 'docente'; // Default
        let datos_contacto = null;

        if (isAgentOrAdmin) {
            // Lógica para Ticket Interno (creado por Agente/Admin)
            if (solicitante_id) {
                // Caso A: Para un usuario registrado existente
                usuario_id = solicitante_id;
                const solicitante = await User.findById(solicitante_id);
                if (solicitante) rolUsuario = solicitante.rol;
            } else {
                // Caso B: Para un invitado/externo (usar datos_contacto)
                const contactoData = datosContactoBody || {};
                datos_contacto = {
                    nombre_completo: contactoData.nombre_completo,
                    email: contactoData.email,
                    telefono: contactoData.telefono,
                    dpi: contactoData.dpi
                };

                // Validación básica para contacto
                if (!datos_contacto.nombre_completo) {
                    return res.status(400).json({ message: 'Nombre del solicitante es requerido para tickets internos de invitados.' });
                }
                rolUsuario = tipo_usuario || 'docente'; // O lo que seleccione el agente
            }

        } else if (req.user) {
            // Lógica estándar: Usuario autenticado crea su propio ticket
            usuario_id = req.user.id;
            rolUsuario = req.user.rol;
        } else {
            // Lógica estándar: Usuario público (sin login)
            const contactoData = datosContactoBody || {};
            datos_contacto = {
                nombre_completo: contactoData.nombre_completo,
                email: contactoData.email,
                telefono: contactoData.telefono,
                dpi: contactoData.dpi
            };
            if (!datos_contacto.nombre_completo || !datos_contacto.email) {
                return res.status(400).json({ message: 'Nombre y Email son requeridos para tickets públicos' });
            }
        }

        console.log('💾 Creating ticket in database...');
        const nuevoTicket = await Ticket.create({
            titulo,
            descripcion,
            prioridad,
            usuario_id,
            tipo_usuario: rolUsuario,
            datos_contacto,
            categoria_id,
            source_id,
            service_type_id,
            creado_por_id,
            estado: (isAgentOrAdmin && estado) ? estado : 'abierto' // Agentes pueden definir estado, usuarios normales no
        });

        // NOTIFICACIÓN INTERNA (Admins/Agentes)
        // No notificar al creador si es el mismo agente
        const admins = await User.find({ rol: { $in: ['admin', 'super_admin', 'agente'] } });
        admins.forEach(admin => {
            if (req.user && admin._id.toString() === req.user.id) return; // No auto-notificar

            notifyUser(
                admin._id,
                'NEW_TICKET',
                `Nuevo Ticket #${nuevoTicket.ticket_id}`,
                `${nuevoTicket.datos_contacto?.nombre_completo || 'Usuario'} ha creado: "${titulo}"`,
                `/portal/tickets/${nuevoTicket._id}`
            );
        });

        // LOG ACTIVIDAD: Creación
        if (req.user) {
            await logActivity(nuevoTicket._id, req.user.id, 'CREACION', {
                descripcion: isAgentOrAdmin && !usuario_id ? 'Ticket Interno (Invitado) creado por agente' : 'Ticket creado'
            });
        }

        res.status(201).json(nuevoTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Obtener lista de tickets (filtrado por rol)
 * @route   GET /api/tickets
 * @access  Private
 * @returns {Array} Lista de tickets (Admins ven todos, Usuarios ven los propios)
 */
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

/**
 * @desc    Obtener detalles de un ticket específico
 * @route   GET /api/tickets/:id
 * @access  Private (Dueño, Admin, Agente)
 * @param   {string} id - ID único del ticket (MongoDB _id)
 */
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

/**
 * @desc    Actualizar un ticket existente (estado, asignación, contenido)
 * @route   PUT /api/tickets/:id
 * @access  Private (Agente/Admin/Dueño)
 * @param   {string} id - ID del ticket
 * @param   {Object} body - Campos a actualizar (estado, prioridad, agente_id, etc.)
 */
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
            // NOTIFICACIÓN EMAIL DESHABILITADA
            /*
            const distEmail = actualizado.usuario_id?.email || actualizado.datos_contacto?.email;
            if (distEmail) {
                sendEmail({
                    to: distEmail,
                    subject: `Actualización de Ticket #${actualizado.ticket_id}`,
                    text: `El estado de tu ticket ha cambiado a: ${actualizado.estado.toUpperCase()}.`
                }).catch(err => console.error('Error enviando email notificación usuario:', err.message));
            }
            */

            // Notifiación Interna al Usuario (si no fue él quien lo cambió)
            if (actualizado.usuario_id && req.user.id !== actualizado.usuario_id._id.toString()) {
                await notifyUser(
                    actualizado.usuario_id._id,
                    'TICKET_STATUS_CHANGED',
                    `Actualización Ticket #${actualizado.ticket_id}`,
                    `Tu ticket ha cambiado a: ${actualizado.estado.toUpperCase()}`,
                    `/portal/tickets/${actualizado._id}`
                );
            }
        }

        // 2. Asignación de Agente -> Notificar al Agente
        // Detectar si cambió el agente (comparando IDs)
        const oldAgentId = ticket.agente_id ? ticket.agente_id.toString() : null;
        const newAgentId = actualizado.agente_id ? actualizado.agente_id._id.toString() : null;

        if (newAgentId && newAgentId !== oldAgentId) {
            // LOG ACTIVIDAD: Asignación
            await logActivity(actualizado._id, req.user.id, 'ASIGNACION', {
                anterior: oldAgentId,
                nuevo: newAgentId,
                descripcion: `Agente asignado: ${actualizado.agente_id.nombre}`
            });

            // Notificación Interna al Nuevo Agente
            await notifyUser(
                newAgentId,
                'TICKET_ASSIGNED',
                `Asignación Ticket #${actualizado.ticket_id}`,
                `Se te ha asignado el ticket: "${actualizado.titulo}"`,
                `/portal/tickets/${actualizado._id}`
            );
        }

        // LOG ACTIVIDAD: Cambio de Estado
        if (req.body.estado && req.body.estado !== ticket.estado) {
            await logActivity(actualizado._id, req.user.id, 'CAMBIO_ESTADO', {
                anterior: ticket.estado,
                nuevo: req.body.estado,
                descripcion: `Estado cambiado a ${req.body.estado}`
            });
        }

        // LOG ACTIVIDAD: Cambio de Prioridad
        if (req.body.prioridad && req.body.prioridad !== ticket.prioridad) {
            await logActivity(actualizado._id, req.user.id, 'CAMBIO_PRIORIDAD', {
                anterior: ticket.prioridad,
                nuevo: req.body.prioridad,
                descripcion: `Prioridad cambiada a ${req.body.prioridad}`
            });
        }

        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Consultar estado público de un ticket
 * @route   GET /api/tickets/status/:id
 * @access  Public
 * @param   {number} id - ID numérico (ticket_id) para consulta fácil
 */
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

// @desc    Obtener historial del ticket
// @route   GET /api/tickets/:id/history
// @access  Private
exports.getTicketHistory = async (req, res) => {
    try {
        const history = await TicketHistory.find({ ticket_id: req.params.id })
            .populate('usuario_id', 'nombre email')
            .sort({ fecha: -1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
