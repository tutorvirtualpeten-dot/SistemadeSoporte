const mongoose = require('mongoose');

const ticketHistorySchema = new mongoose.Schema({
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
    accion: {
        type: String, // CREACION, CAMBIO_ESTADO, ASIGNACION, COMENTARIO, PRIORIDAD
        required: true
    },
    detalles: {
        anterior: mongoose.Schema.Types.Mixed,
        nuevo: mongoose.Schema.Types.Mixed,
        descripcion: String
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TicketHistory', ticketHistorySchema);
