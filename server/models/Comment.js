const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    ticket_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mensaje: {
        type: String,
        required: true
    },
    es_interno: {
        type: Boolean,
        default: false
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema);
