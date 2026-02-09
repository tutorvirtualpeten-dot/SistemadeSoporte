const TicketSource = require('../models/TicketSource');

// @desc    Obtener todas las fuentes de ticket
// @route   GET /api/ticket-sources
// @access  Private (Admin/Agente)
exports.getTicketSources = async (req, res) => {
    try {
        const sources = await TicketSource.find().sort({ fecha_creacion: -1 });
        res.json(sources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear nueva fuente de ticket
// @route   POST /api/ticket-sources
// @access  Private (Admin)
exports.createTicketSource = async (req, res) => {
    try {
        const { nombre, activo } = req.body;
        const source = await TicketSource.create({ nombre, activo });
        res.status(201).json(source);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Actualizar fuente de ticket
// @route   PUT /api/ticket-sources/:id
// @access  Private (Admin)
exports.updateTicketSource = async (req, res) => {
    try {
        const { nombre, activo } = req.body;
        const source = await TicketSource.findByIdAndUpdate(
            req.params.id,
            { nombre, activo },
            { new: true }
        );
        if (!source) return res.status(404).json({ message: 'Fuente no encontrada' });
        res.json(source);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Eliminar fuente de ticket
// @route   DELETE /api/ticket-sources/:id
// @access  Private (Admin)
exports.deleteTicketSource = async (req, res) => {
    try {
        const source = await TicketSource.findById(req.params.id);
        if (!source) return res.status(404).json({ message: 'Fuente no encontrada' });
        await source.deleteOne();
        res.json({ message: 'Fuente eliminada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
