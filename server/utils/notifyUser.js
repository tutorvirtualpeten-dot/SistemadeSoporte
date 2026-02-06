const Notification = require('../models/Notification');

/**
 * Crea una notificación para un usuario específico
 * @param {string} recipientId - ID del usuario que recibe la notificación
 * @param {string} type - Tipo (TICKET_ASSIGNED, etc.)
 * @param {string} title - Título corto
 * @param {string} message - Mensaje detallado
 * @param {string} link - Link opcional
 */
const notifyUser = async (recipientId, type, title, message, link = null) => {
    try {
        await Notification.create({
            recipient: recipientId,
            type,
            title,
            message,
            link
        });
    } catch (error) {
        console.error(`Error creando notificación para ${recipientId}:`, error);
    }
};

module.exports = notifyUser;
