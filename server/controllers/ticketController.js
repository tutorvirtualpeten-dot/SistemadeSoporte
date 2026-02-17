const Ticket = require('../models/Ticket');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const { sendTicketNotification } = require('../utils/emailService');
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

        // ASIGNACIÓN AUTOMÁTICA (Round Robin - Least Loaded)
        let agente_asignado_id = null;

        // Si el usuario envía un agente específico (solo Admins/Agentes pueden forzarlo)
        if (isAgentOrAdmin && req.body.agente_id) {
            agente_asignado_id = req.body.agente_id;
        } else {
            // Buscar el agente con MENOS tickets activos (abierto/en_progreso)
            const agentes = await User.find({ rol: 'agente' }).select('_id nombre');

            if (agentes.length > 0) {
                // Obtener conteos para cada agente
                const cargas = await Promise.all(agentes.map(async (agente) => {
                    const count = await Ticket.countDocuments({
                        agente_id: agente._id,
                        estado: { $in: ['abierto', 'en_progreso'] }
                    });
                    return { id: agente._id, count };
                }));

                // Ordenar por carga ascendente (el reporte con menos tickets primero)
                cargas.sort((a, b) => a.count - b.count);

                // Asignar al primero
                agente_asignado_id = cargas[0].id;
                console.log(`🤖 Auto-asignando ticket a Agente ID: ${agente_asignado_id} (Carga actual: ${cargas[0].count})`);
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
            agente_id: agente_asignado_id, // Nueva asignación
            estado: (isAgentOrAdmin && estado) ? estado : 'abierto'
            // fecha_limite_resolucion se calcula en el hook pre-save del modelo
        });

        // NOTIFICACIÓN INTERNA (Admins/Agentes)
        const admins = await User.find({ rol: { $in: ['admin', 'super_admin', 'agente'] } });
        for (const admin of admins) {
            if (req.user && admin._id.toString() === req.user.id) continue; // No auto-notificar

            // In-App
            notifyUser(
                admin._id,
                'NEW_TICKET',
                `Nuevo Ticket #${nuevoTicket.ticket_id}`,
                `${nuevoTicket.datos_contacto?.nombre_completo || 'Usuario'} ha creado: "${titulo}"`,
                `/portal/tickets/${nuevoTicket._id}`
            );

            // Email a Admins/Agentes
            // if (admin.email) {
            //     sendEmail({
            //         to: admin.email,
            //         subject: `Nuevo Ticket #${nuevoTicket.ticket_id}: ${titulo}`,
            //         text: `Se ha creado un nuevo ticket.\nSolicitante: ${nuevoTicket.datos_contacto?.nombre_completo || 'Anónimo'}\nTítulo: ${titulo}\n\nVer en plataforma: /portal/tickets/${nuevoTicket._id}`,
            //         html: `<p>Hola <strong>${admin.nombre}</strong>,</p>
            //                <p>Se ha recibido un nuevo ticket de soporte.</p>
            //                <ul>
            //                 <li><strong>Ticket:</strong> #${nuevoTicket.ticket_id}</li>
            //                 <li><strong>Solicitante:</strong> ${nuevoTicket.datos_contacto?.nombre_completo || 'Anónimo'}</li>
            //                 <li><strong>Asunto:</strong> ${titulo}</li>
            //                </ul>
            //                <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/portal/tickets/${nuevoTicket._id}">Ver Ticket</a>`
            //     }).catch(err => console.error('Error sending admin email:', err));
            // } // DESHABILITADO TEMPORALMENTE
        }

        // CONFIRMACIÓN AL USUARIO (Email)
        const userEmail = datos_contacto?.email || (req.user ? req.user.email : null);
        const userName = datos_contacto?.nombre_completo || (req.user ? req.user.nombre : 'Usuario');

        // CONFIRMACIÓN AL USUARIO (Email)
        // if (userEmail) {
        //     sendEmail({
        //         to: userEmail,
        //         subject: `Ticket Recibido: #${nuevoTicket.ticket_id}`,
        //         text: `Hola ${userName},\n\nHemos recibido tu solicitud "${titulo}".\nUn agente la revisará pronto.\n\nNúmero de Ticket: #${nuevoTicket.ticket_id}`,
        //         html: `<p>Hola <strong>${userName}</strong>,</p>
        //                <p>Hemos recibido correctamente tu solicitud de soporte.</p>
        //                <p><strong>Ticket ID:</strong> #${nuevoTicket.ticket_id}</p>
        //                <p><strong>Estado:</strong> Abierto</p>
        //                <hr/>
        //                <p>Un agente revisará tu caso a la brevedad posible.</p>`
        //     }).catch(err => console.error('Error sending confirmation email:', err));
        // } // DESHABILITADO TEMPORALMENTE

        // NOTIFICACIÓN ESPECÍFICA AL AGENTE ASIGNADO (Si es diferente al creador)
        if (agente_asignado_id && (!req.user || agente_asignado_id.toString() !== req.user.id)) {
            // Ya cubierto arriba si es admin/agente, pero reforzamos la asignación específica
            notifyUser(
                agente_asignado_id,
                'TICKET_ASSIGNED',
                `¡Nuevo Ticket Asignado! #${nuevoTicket.ticket_id}`,
                `Se te ha asignado automáticamente: "${titulo}"`,
                `/portal/tickets/${nuevoTicket._id}`
            );
            // Email específico de asignación (opcional, ya recibe el de "Nuevo Ticket" si es agente, pero este es más directo)
        }

        // LOG ACTIVIDAD: Creación
        if (req.user) {
            await logActivity(nuevoTicket._id, req.user.id, 'CREACION', {
                descripcion: isAgentOrAdmin && !usuario_id ? 'Ticket Interno (Invitado) creado por agente' : 'Ticket creado'
            });
        }

        // 📧 NOTIFICACIÓN CENTRALIZADA VIA BREVO: Creación de Ticket
        await sendTicketNotification('TICKET_CREATED', nuevoTicket);

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

        // Obtener parámetros de ordenamiento
        const sortBy = req.query.sortBy || 'fecha_creacion';
        const order = req.query.order === 'asc' ? 1 : -1;

        const sortOptions = {};
        sortOptions[sortBy] = order;

        // Si es admin o super_admin, ve todos
        if (req.user.rol === 'admin' || req.user.rol === 'super_admin') {
            tickets = await Ticket.find()
                .populate('usuario_id', 'nombre email')
                .populate('agente_id', 'nombre email')
                .populate('categoria_id', 'nombre')
                .sort(sortOptions);
        } else if (req.user.rol === 'agente') {
            // Si es agente, ve:
            // 1. Asignados a él
            // 2. Creados por él
            // 3. Sin asignar (para tomarlo)
            tickets = await Ticket.find({
                $or: [
                    { agente_id: req.user.id },
                    { creado_por_id: req.user.id },
                    { agente_id: null }
                ]
            })
                .populate('usuario_id', 'nombre email')
                .populate('agente_id', 'nombre email')
                .populate('categoria_id', 'nombre')
                .sort(sortOptions);
        } else {
            // Si es usuario, solo ve los suyos
            tickets = await Ticket.find({ usuario_id: req.user.id })
                .populate('categoria_id', 'nombre')
                .sort(sortOptions);
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
            return res.status(404).json({ message: 'El ticket solicitado no existe o ha sido eliminado.' });
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
            return res.status(404).json({ message: 'No se pudo encontrar el ticket solicitado. Por favor, verifique el número de ticket e intente nuevamente.' });
        }

        // Verificar permisos
        const isOwner = ticket.usuario_id && ticket.usuario_id.toString() === req.user.id;
        const isAdminOrAgent = req.user.rol === 'admin' || req.user.rol === 'super_admin' || req.user.rol === 'agente';

        console.log('UpdateTicket Debug:', {
            userId: req.user.id,
            userRol: req.user.rol,
            ticketId: ticket._id,
            isOwner,
            isAdminOrAgent,
            body: req.body
        });

        if (!isOwner && !isAdminOrAgent) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        let updateData = req.body;

        // Si es dueño pero NO admin/agente, restringir campos
        // Si es dueño pero NO admin/agente, restringir campos
        if (isOwner && !isAdminOrAgent) {
            const { titulo, descripcion, datos_contacto, archivo_adjunto, categoria_id } = req.body;
            updateData = { titulo, descripcion, datos_contacto, archivo_adjunto, categoria_id };
            // Forzar actualización de fecha
            updateData.fecha_actualizacion = Date.now();
        } else {
            // Si es Admin/Agente, permitir todo, pero tratar agente_id específicamente si viene
            if (req.body.hasOwnProperty('agente_id')) {
                updateData.agente_id = req.body.agente_id || null; // Convertir "" a null
            }
        }

        // Logic moved or redundant.
        let oldAgentId = ticket.agente_id ? ticket.agente_id.toString() : null;


        // 2. Asignación de Agente -> Notificar al Agente
        // Detectar si cambió el agente (comparando IDs)
        // Detectar si cambió el agente
        let newAgentId = undefined;

        if (req.body.hasOwnProperty('agente_id')) {
            // Permitir desasignar (null o string vacío)
            newAgentId = req.body.agente_id ? req.body.agente_id : null;
            updateData.agente_id = newAgentId;
        }

        // Si es agente, SOLO puede asignarse/desasignarse a SÍ MISMO o tomar tickets libres
        // Sin embargo, la regla general 'isAdminOrAgent' ya pasó arriba.
        // Aquí podríamos refinar para que no asignen a OTROS agentes, pero por ahora lo dejamos flexible o lo restringimos si se pide.

        // ... Log y Notificaciones ...

        const actualizado = await Ticket.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('usuario_id', 'email nombre').populate('agente_id', 'email nombre');

        // Re-evaluar IDs tras update para notificación
        newAgentId = actualizado.agente_id ? actualizado.agente_id._id.toString() : null;

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

            // 📧 NOTIFICACIÓN CENTRALIZADA VIA BREVO: Asignación de Agente
            await sendTicketNotification('AGENT_ASSIGNED', actualizado, {
                agentName: actualizado.agente_id.nombre
            });
        }

        // LOG ACTIVIDAD: Cambio de Estado
        if (req.body.estado && req.body.estado !== ticket.estado) {
            await logActivity(actualizado._id, req.user.id, 'CAMBIO_ESTADO', {
                anterior: ticket.estado,
                nuevo: req.body.estado,
                descripcion: `Estado cambiado a ${req.body.estado}`
            });

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

            // 📧 NOTIFICACIÓN CENTRALIZADA VIA BREVO: Cambio de Estado
            await sendTicketNotification('STATUS_CHANGED', actualizado, {
                oldStatus: ticket.estado,
                newStatus: req.body.estado
            });
        }

        // LOG ACTIVIDAD: Cambio de Prioridad
        if (req.body.prioridad && req.body.prioridad !== ticket.prioridad) {
            await logActivity(actualizado._id, req.user.id, 'CAMBIO_PRIORIDAD', {
                anterior: ticket.prioridad,
                nuevo: req.body.prioridad,
                descripcion: `Prioridad cambiada a ${req.body.prioridad}`
            });

            // NOTIFICAR AL AGENTE ASIGNADO
            if (actualizado.agente_id) {
                // In-App
                await notifyUser(
                    actualizado.agente_id._id,
                    'TICKET_UPDATED',
                    `⚠️ Cambio de Prioridad #${actualizado.ticket_id}`,
                    `La prioridad ha cambiado de ${ticket.prioridad} a ${req.body.prioridad}`,
                    `/portal/tickets/${actualizado._id}`
                );

                // Email\r\n                // if (actualizado.agente_id.email) {\r\n                //     await sendEmail({\r\n                //         to: actualizado.agente_id.email,\r\n                //         subject: `⚠️ Cambio de Prioridad: Ticket #${actualizado.ticket_id}`,\r\n                //         text: `El ticket #${actualizado.ticket_id} ha cambiado de prioridad ${ticket.prioridad} a ${req.body.prioridad}.`,\r\n                //         html: `<p>La prioridad del ticket <strong>#${actualizado.ticket_id}</strong> ha cambiado.</p>\r\n                //                <p><strong>Anterior:</strong> ${ticket.prioridad}</p>\r\n                //                <p><strong>Nueva:</strong> ${req.body.prioridad}</p>\r\n                //                <a href=\"${process.env.NEXT_PUBLIC_APP_URL || ''}/portal/tickets/${actualizado._id}\">Ver Ticket</a>`\r\n                //     });\r\n                // } // DESHABILITADO TEMPORALMENTE
            }
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
            return res.status(404).json({ message: 'No se encontró información pública para este número de ticket.' });
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
        if (!ticket) return res.status(404).json({ message: 'No se puede comentar porque el ticket no existe.' });

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
        if (!ticket) return res.status(404).json({ message: 'No se puede calificar un ticket que no existe.' });

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
            return res.status(404).json({ message: 'No se puede eliminar el ticket porque no existe.' });
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
