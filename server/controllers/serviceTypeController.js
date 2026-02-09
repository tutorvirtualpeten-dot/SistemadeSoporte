const ServiceType = require('../models/ServiceType');

// @desc    Obtener todos los tipos de servicio
// @route   GET /api/service-types
// @access  Private (Admin/Agente)
exports.getServiceTypes = async (req, res) => {
    try {
        const types = await ServiceType.find().sort({ fecha_creacion: -1 });
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear nuevo tipo de servicio
// @route   POST /api/service-types
// @access  Private (Admin)
exports.createServiceType = async (req, res) => {
    try {
        const { nombre, descripcion, activo } = req.body;
        const type = await ServiceType.create({ nombre, descripcion, activo });
        res.status(201).json(type);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Este tipo de servicio ya existe (nombre y descripción duplicados)' });
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Actualizar tipo de servicio
// @route   PUT /api/service-types/:id
// @access  Private (Admin)
exports.updateServiceType = async (req, res) => {
    try {
        const { nombre, descripcion, activo } = req.body;
        const type = await ServiceType.findByIdAndUpdate(
            req.params.id,
            { nombre, descripcion, activo },
            { new: true }
        );
        if (!type) return res.status(404).json({ message: 'Tipo de servicio no encontrado' });
        res.json(type);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Eliminar tipo de servicio
// @route   DELETE /api/service-types/:id
// @access  Private (Admin)
exports.deleteServiceType = async (req, res) => {
    try {
        const type = await ServiceType.findById(req.params.id);
        if (!type) return res.status(404).json({ message: 'Tipo de servicio no encontrado' });
        await type.deleteOne();
        res.json({ message: 'Tipo de servicio eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
