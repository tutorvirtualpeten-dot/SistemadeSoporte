const FAQ = require('../models/FAQ');

// @desc    Obtener FAQs (Público/Portal)
// @route   GET /api/faqs
// @access  Private (Todos)
exports.getFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find({ visible: true });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener todas las FAQs (Admin)
// @route   GET /api/admin/faqs
// @access  Private (Admin)
exports.getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find();
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear FAQ
// @route   POST /api/admin/faqs
// @access  Private (Admin)
exports.createFAQ = async (req, res) => {
    try {
        const faq = await FAQ.create(req.body);
        res.status(201).json(faq);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Actualizar FAQ
// @route   PUT /api/admin/faqs/:id
// @access  Private (Admin)
exports.updateFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!faq) return res.status(404).json({ message: 'FAQ no encontrada' });
        res.json(faq);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Eliminar FAQ
// @route   DELETE /api/admin/faqs/:id
// @access  Private (Admin)
exports.deleteFAQ = async (req, res) => {
    try {
        await FAQ.findByIdAndDelete(req.params.id);
        res.json({ message: 'FAQ eliminada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
