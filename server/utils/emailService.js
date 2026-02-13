const { Resend } = require('resend');

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        // 1. Verificar que existe la API key
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn('⚠️ RESEND_API_KEY no configurada. No se envió el correo.');
            return false;
        }

        // 2. Crear cliente de Resend
        const resend = new Resend(apiKey);

        // 3. Configurar remitente
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        // 4. Enviar correo
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: Array.isArray(to) ? to : [to],
            subject,
            html: html || text, // Resend prefiere HTML, usa text como fallback
        });

        if (error) {
            console.error('❌ Error de Resend:', error);
            return false;
        }

        console.log('✅ Correo enviado via Resend:', data.id);
        return true;

    } catch (error) {
        console.error('❌ Error enviando correo:', error);
        return false; // No lanzar error para evitar bloquear el flujo principal
    }
};

module.exports = sendEmail;

