const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    nombre_app: {
        type: String,
        default: 'Soporte Petén'
    },
    logo_url: {
        type: String
    },
    smtp_config: {
        host: String,
        port: Number,
        user: String,
        pass: String
    },
    // Configuración de Módulos (Permisos de acceso por rol)
    // admin, agente (super_admin siempre tiene acceso implícito)
    modulos: {
        tickets: { type: [String], default: ['admin', 'agente'] },
        users: { type: [String], default: [] }, // Solo super_admin por defecto
        categories: { type: [String], default: ['admin'] },
        faqs: { type: [String], default: ['admin'] },
        responses: { type: [String], default: ['admin', 'agente'] },
        catalogs: { type: [String], default: ['admin', 'agente'] },
        audit: { type: [String], default: [] },
        settings: { type: [String], default: ['admin'] }
    }
});

module.exports = mongoose.model('Setting', settingSchema);
