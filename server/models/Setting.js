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
    }
});

module.exports = mongoose.model('Setting', settingSchema);
