const Ticket = require('../models/Ticket');
const User = require('../models/User');
const notifyUser = require('../utils/notifyUser');
const sendEmail = require('../utils/emailService');

// @desc    Verificar tickets vencidos (SLA Breach)
// @route   GET /api/cron/check-sla
// @access  Public (Protected by Secret)
exports.checkSLABreach = async (req, res) => {
    try {
        // 1. Verificar seguridad (CRON_SECRET)
        const secret = req.headers['authorization']?.split(' ')[1] || req.query.key;
        if (secret !== process.env.CRON_SECRET) {
            return res.status(401).json({ message: 'Unauthorized Cron Access' });
        }

        console.log('⏰ Running SLA Check...');

        // 2. Buscar tickets vencidos no notificados
        const now = new Date();
        const overdueTickets = await Ticket.find({
            estado: { $in: ['abierto', 'en_progreso'] },
            fecha_limite_resolucion: { $lt: now },
            sla_notified: { $ne: true }
        }).populate('agente_id', 'nombre email')
            .populate('usuario_id', 'nombre');

        console.log(`🔎 Found ${overdueTickets.length} overdue tickets.`);

        if (overdueTickets.length === 0) {
            return res.json({ message: 'No overdue tickets found.', count: 0 });
        }

        // 3. Obtener Admins para notificar también
        const admins = await User.find({ rol: { $in: ['admin', 'super_admin'] } });

        // 4. Procesar cada ticket
        let processed = 0;
        for (const ticket of overdueTickets) {
            try {
                // Notificar Agente Asignado
                if (ticket.agente_id) {
                    // In-App
                    await notifyUser(
                        ticket.agente_id._id,
                        'SYSTEM',
                        `🚨 SLA Vencido: Ticket #${ticket.ticket_id}`,
                        `El ticket "${ticket.titulo}" ha excedido su tiempo límite de resolución.`,
                        `/portal/tickets/${ticket._id}`
                    );

                    // Email
                    if (ticket.agente_id.email) {
                        await sendEmail({
                            to: ticket.agente_id.email,
                            subject: `🚨 ALERTA SLA: Ticket #${ticket.ticket_id} Vencido`,
                            text: `El ticket #${ticket.ticket_id} está vencido.\nFecha Límite: ${ticket.fecha_limite_resolucion.toLocaleString()}`,
                            html: `<p>El ticket <strong>#${ticket.ticket_id}</strong> ha vencido.</p>
                                   <p><strong>Título:</strong> ${ticket.titulo}</p>
                                   <p><strong>Límite:</strong> ${ticket.fecha_limite_resolucion.toLocaleString()}</p>
                                   <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/portal/tickets/${ticket._id}">Ver Ticket</a>`
                        });
                    }
                }

                // Notificar Admins
                for (const admin of admins) {
                    await notifyUser(
                        admin._id,
                        'SYSTEM',
                        `🚨 SLA Vencido: Ticket #${ticket.ticket_id}`,
                        `Agente: ${ticket.agente_id ? ticket.agente_id.nombre : 'Sin asignar'}`,
                        `/portal/tickets/${ticket._id}`
                    );

                    // Opcional: Email a admins (comentado para evitar spam masivo si hay muchos)
                    // await sendEmail(...)
                }

                // Marcar como notificado
                ticket.sla_notified = true;
                await ticket.save();
                processed++;

            } catch (err) {
                console.error(`Error processing ticket ${ticket._id}:`, err);
            }
        }

        res.json({ message: 'SLA Check Completed', processed, total: overdueTickets.length });
    } catch (error) {
        console.error('SLA Check Error:', error);
        res.status(500).json({ message: error.message });
    }
};
