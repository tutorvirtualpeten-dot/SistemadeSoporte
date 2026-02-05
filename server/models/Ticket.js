const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        enum: ['abierto', 'en_progreso', 'resuelto', 'cerrado'],
        default: 'abierto'
    },
    prioridad: {
        type: String,
        enum: ['baja', 'media', 'alta', 'critica'],
        default: 'media'
    },
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    agente_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tipo_usuario: {
        type: String,
        enum: ['docente', 'administrativo'],
        required: true
    },
    datos_contacto: {
        nombre_completo: String,
        dpi: String,
        email: String,
        telefono: String
    },
    categoria_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    archivos: [{
        url: String,
        public_id: String,
        nombre_original: String
    }],
    ticket_id: {
        type: Number,
        unique: true,
        sparse: true // Permite que existan tickets antiguos sin este campo
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    },
    fecha_actualizacion: {
        type: Date,
        default: Date.now
    },
    calificacion: {
        type: Number,
        min: 1,
        max: 5
    },
    mensaje_resolucion: { // Mensaje opcional del usuario al cerrar
        type: String
    }
});

const Counter = require('./Counter');

ticketSchema.pre('save', async function () {
    if (!this.isNew) return;

    try {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'ticketId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        // Si es el primero, seq será 1. Podemos sumar 10000 para que empiece en 10001
        this.ticket_id = counter.seq + 10000;
    } catch (error) {
        throw error; // Mongoose capturará esto como error de validación/guardado
    }
});

module.exports = mongoose.model('Ticket', ticketSchema);
