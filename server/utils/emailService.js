const nodemailer = require('nodemailer');
const Setting = require('../models/Setting');

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        // 1. Obtener configuración de la BD
        const settings = await Setting.findOne();

        if (!settings || !settings.smtp_config || !settings.smtp_config.host) {
            console.warn('⚠️ SMTP no configurado. No se envió el correo.');
            return false;
        }

        const { host, port, user, pass } = settings.smtp_config;

        // 2. Crear transportador
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true para 465, false para otros
            auth: {
                user,
                pass
            },
            tls: {
                rejectUnauthorized: false // Ayuda con certificados auto-firmados en desarrollo
            }
        });

        // 3. Enviar correo
        const info = await transporter.sendMail({
            from: `"${settings.nombre_app || 'Soporte'}" <${user}>`,
            to,
            subject,
            text,
            html
        });

        console.log('✅ Correo enviado:', info.messageId);
        return true;

    } catch (error) {
        console.error('❌ Error enviando correo:', error);
        throw error; // Propagar error para que el controlador sepa qué pasó
    }
};

module.exports = sendEmail;
