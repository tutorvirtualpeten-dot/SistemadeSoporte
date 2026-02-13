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
    },
    // Flag para saber si ya se notificó el vencimiento
    sla_notified: {
        type: Boolean,
        default: false
    },
});

const Counter = require('./Counter');

ticketSchema.pre('save', async function () {
    // Calcular SLA si es nuevo o si cambió la prioridad
    if (this.isNew || this.isModified('prioridad')) {
        const now = new Date();

        // Obtener configuración de SLA desde la BD
        const Setting = mongoose.model('Setting');
        const settings = await Setting.findOne();

        // Valores por defecto
        let slas = {
            'critica': 4,
            'alta': 24,
            'media': 72,
            'baja': 168
        };

        // Sobreescribir con valores de BD si existen
        if (settings && settings.sla) {
            slas = {
                'critica': settings.sla.critica || 4,
                'alta': settings.sla.alta || 24,
                'media': settings.sla.media || 72,
                'baja': settings.sla.baja || 168
            };
        }

        const horas = slas[this.prioridad] || 72; // Default media

        // Clonar fecha actual y sumar horas
        const limite = new Date(now.getTime() + horas * 60 * 60 * 1000);
        this.fecha_limite_resolucion = limite;
    }

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
        // Mongoose capturará esto como error de validación/guardado
        throw error;
    }
});

module.exports = mongoose.model('Ticket', ticketSchema);
