const mongoose = require('mongoose');
const sendEmail = require('./utils/emailService');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soporte_peten_db';

(async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ DB Conectada');

        console.log('📧 Intentando enviar correo...');
        // Intenta enviar a un correo dummy o al admin (hardcoded for test)
        await sendEmail({
            to: 'test@example.com',
            subject: 'Debug Email',
            text: 'Test de depuración'
        });

        console.log('✅ Correo enviado (aparentemente)');
    } catch (error) {
        console.error('❌ ERROR CAPTURADO EN SCRIPT:', error);
        if (error.code) console.error('CODE:', error.code);
        if (error.command) console.error('COMMAND:', error.command);
    } finally {
        await mongoose.disconnect();
    }
})();
