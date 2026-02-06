const Notification = require('../models/Notification');

/**
 * @desc    Obtener notificaciones del usuario autenticado
 * @route   GET /api/notifications
 * @access  Private
 * @returns {Object} { notifications: [], unreadCount: number }
 */
// @desc    Obtener notificaciones del usuario actual
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20); // Limitamos a las últimas 20

        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            read: false
        });

        res.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Marcar una notificación específica como leída
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 * @param   {string} id - ID de la notificación
 */
// @desc    Marcar notificación como leída
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }

        // Verificar que la notificación pertenezca al usuario
        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        notification.read = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Marcar todas como leídas
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { $set: { read: true } }
        );

        res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
