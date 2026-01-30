const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    tipo: {
        type: String,
        enum: ['docente', 'administrativo', 'global'],
        default: 'global'
    },
    activo: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Category', categorySchema);
