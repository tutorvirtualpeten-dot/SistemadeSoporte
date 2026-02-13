const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        // required: true // Opcional para agentes
    },
    estado: {
        type: String,
        enum: ['abierto', 'en_progreso', 'resuelto', 'cerrado'],
        default: 'abierto'
    },
    // Prioridad para SLA (Service Level Agreement)
    prioridad: {
        type: String,
        enum: ['baja', 'media', 'alta', 'critica'],
        default: 'media'
    },
    // Usuario que reporta el problema (si es autenticado)
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Agente técnico asignado
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
        // required removed
    },
    // Medio de Solicitud (Llamada, Presencial, etc.)
    source_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TicketSource'
    },
    // Tipo de Servicio
    service_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceType'
    },
    // Usuario Agente/Admin que creó el ticket (si aplica)
    creado_por_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Adjuntos (Imágenes/PDFs) subidos a Cloudinary/S3
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
    },
    // SLA: Fecha límite de resolución
    fecha_limite_resolucion: {
        type: Date
    }
});

const Counter = require('./Counter');

ticketSchema.pre('save', async function (next) { // Add next
    // Calcular SLA si es nuevo o si cambió la prioridad
    if (this.isNew || this.isModified('prioridad')) {
        const now = new Date();
        // Definir horas a sumar según prioridad
        const slas = {
            'critica': 4,      // 4 horas
            'alta': 24,        // 24 horas (1 día)
            'media': 72,       // 72 horas (3 días)
            'baja': 168        // 168 horas (7 días)
        };

        const horas = slas[this.prioridad] || 72; // Default media

        // Clonar fecha actual y sumar horas
        const limite = new Date(now.getTime() + horas * 60 * 60 * 1000);
        this.fecha_limite_resolucion = limite;
    }

    if (!this.isNew) return next();

    try {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'ticketId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        // Si es el primero, seq será 1. Podemos sumar 10000 para que empiece en 10001
        this.ticket_id = counter.seq + 10000;
        next();
    } catch (error) {
        // throw error; // Mongoose capturará esto como error de validación/guardado
        next(error);
    }
});

module.exports = mongoose.model('Ticket', ticketSchema);
