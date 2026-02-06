const mongoose = require('mongoose');

const cannedResponseSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    contenido: {
        type: String,
        required: true
    },
    atajo: {
        type: String,
        trim: true,
        unique: true,
        sparse: true // Allow null/undefined to not clash
    },
    creado_por: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CannedResponse', cannedResponseSchema);
