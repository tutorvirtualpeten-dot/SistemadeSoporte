
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
