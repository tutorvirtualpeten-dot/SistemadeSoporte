const CannedResponse = require('../models/CannedResponse');

// @desc    Obtener todas las respuestas rápidas
// @route   GET /api/canned-responses
// @access  Private (Admin/Agente)
exports.getCannedResponses = async (req, res) => {
    try {
        const responses = await CannedResponse.find().sort({ titulo: 1 });
        res.json(responses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear respuesta rápida
// @route   POST /api/canned-responses
// @access  Private (Admin)
exports.createCannedResponse = async (req, res) => {
    try {
        const { titulo, contenido, atajo } = req.body;

        const nuevaRespuesta = await CannedResponse.create({
            titulo,
            contenido,
            atajo,
            creado_por: req.user.id
        });

        res.status(201).json(nuevaRespuesta);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'El atajo ya existe' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Eliminar respuesta rápida
// @route   DELETE /api/canned-responses/:id
// @access  Private (Admin)
exports.deleteCannedResponse = async (req, res) => {
    try {
        const response = await CannedResponse.findById(req.params.id);

        if (!response) {
            return res.status(404).json({ message: 'Respuesta no encontrada' });
        }

        await response.deleteOne();
        res.json({ message: 'Respuesta eliminada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Actualizar respuesta rápida
// @route   PUT /api/canned-responses/:id
// @access  Private (Admin)
exports.updateCannedResponse = async (req, res) => {
    try {
        const { titulo, contenido, atajo } = req.body;
        const response = await CannedResponse.findByIdAndUpdate(
            req.params.id,
            { titulo, contenido, atajo },
            { new: true, runValidators: true }
        );

        if (!response) {
            return res.status(404).json({ message: 'Respuesta no encontrada' });
        }

        res.json(response);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'El atajo ya existe' });
        }
        res.status(500).json({ message: error.message });
    }
};
