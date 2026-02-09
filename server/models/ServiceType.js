const mongoose = require('mongoose');

const serviceTypeSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    descripcion: {
        type: String,
        trim: true
    },
    activo: {
        type: Boolean,
        default: true
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ServiceType', serviceTypeSchema);

serviceTypeSchema.index({ nombre: 1, descripcion: 1 }, { unique: true });
