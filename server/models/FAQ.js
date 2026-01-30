const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    pregunta: {
        type: String,
        required: true
    },
    respuesta: {
        type: String,
        required: true
    },
    categoria: {
        type: String,
        required: true
    },
    visible: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('FAQ', faqSchema);
