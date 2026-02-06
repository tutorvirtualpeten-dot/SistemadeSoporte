const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accion: {
        type: String, // LOGIN, UPDATE_SETTINGS, CREATE_USER, DELETE_USER, etc.
        required: true
    },
    detalles: {
        type: mongoose.Schema.Types.Mixed // Flexible object for storing relevant data
    },
    ip: {
        type: String
    },
    userAgent: {
        type: String
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SystemLog', systemLogSchema);
