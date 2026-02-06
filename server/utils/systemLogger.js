const SystemLog = require('../models/SystemLog');

/**
 * Logs a system-wide event.
 * @param {string} userId - ID of the user performing the action.
 * @param {string} action - Action identifier (e.g., 'LOGIN', 'UPDATE_SETTINGS').
 * @param {object} details - Additional data (e.g., { changedField: 'logo' }).
 * @param {object} req - Express request object (optional, to extract IP/UserAgent).
 */
const logSystem = async (userId, action, details = {}, req = null) => {
    try {
        let ip = null;
        let userAgent = null;

        if (req) {
            ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            userAgent = req.headers['user-agent'];
        }

        await SystemLog.create({
            usuario_id: userId,
            accion: action,
            detalles: details,
            ip,
            userAgent
        });
    } catch (error) {
        console.error('Error creating system log:', error);
        // We don't want to crash the request if logging fails, so we just log the error.
    }
};

module.exports = logSystem;
