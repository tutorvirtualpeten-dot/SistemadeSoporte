const TicketHistory = require('../models/TicketHistory');

/**
 * Registra una actividad en el historial del ticket
 * @param {string} ticketId - ID del ticket
 * @param {string} userId - ID del usuario que realiza la acción
 * @param {string} accion - Tipo de acción (CAMBIO_ESTADO, ASIGNACION, etc.)
 * @param {object} detalles - Objeto con detalles { anterior, nuevo, descripcion }
 */
const logActivity = async (ticketId, userId, accion, detalles) => {
    try {
        await TicketHistory.create({
            ticket_id: ticketId,
            usuario_id: userId,
            accion,
            detalles
        });
    } catch (error) {
        console.error('Error al registrar historial:', error);
        // No lanzamos error para no interrumpir el flujo principal
    }
};

module.exports = logActivity;
