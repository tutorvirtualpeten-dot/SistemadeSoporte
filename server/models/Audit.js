const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    accion: {
        type: String,
        required: true
    },
    detalles: {
        type: mongoose.Schema.Types.Mixed
    },
    ip: {
        type: String
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Audit', auditSchema);
