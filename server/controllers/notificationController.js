const Notification = require('../models/Notification');

// @desc    Obtener notificaciones del usuario actual
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient_id: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50); // Traer las últimas 50

        // Contar no leídas
        const unreadCount = await Notification.countDocuments({
            recipient_id: req.user.id,
            read: false
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Marcar notificación como leída
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient_id: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }

        notification.read = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Marcar todas como leídas
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient_id: req.user.id, read: false },
            { $set: { read: true } }
        );
        res.json({ message: 'Todas marcadas como leídas' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
