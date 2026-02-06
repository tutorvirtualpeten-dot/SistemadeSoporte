const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        // super_admin: Acceso total + Configuración
        // admin: Gestión de usuarios y reportes
        // agente: Gestión de tickets
        enum: ['super_admin', 'admin', 'agente'],
        default: 'agente'
    },
    dpi: {
        type: String,
        trim: true
    },
    telefono: {
        type: String,
        trim: true
    },
    departamento: {
        type: String,
        trim: true
    },
    materia: {
        type: String,
        trim: true
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
