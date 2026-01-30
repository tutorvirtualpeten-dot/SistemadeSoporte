const Category = require('../models/Category');

// @desc    Obtener todas las categorías
// @route   GET /api/categories
// @access  Public (o Private dependiendo de si mostramos todas en filtro publico)
exports.getCategories = async (req, res) => {
    try {
        const query = req.query.tipo ? { tipo: req.query.tipo } : {};
        // Si no es admin, solo devuelve las activas? 
        // Por ahora devolvemos todas y el frontend filtra o usamos otro endpoint publico

        const categories = await Category.find(query).sort({ nombre: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear categoría
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
    try {
        const { nombre, tipo, activo } = req.body;
        const category = await Category.create({ nombre, tipo, activo });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Actualizar categoría
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Eliminar categoría
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });

        await category.deleteOne();
        res.json({ message: 'Categoría eliminada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
