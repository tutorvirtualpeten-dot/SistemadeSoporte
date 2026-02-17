require('dotenv').config();
const { Resend } = require('resend');

/**
 * Script de prueba para verificar la configuración de Resend
 */
async function testResend() {
    console.log('🔍 Verificando configuración de Resend...\n');

    // 1. Verificar variables de entorno
    console.log('📋 Variables de entorno:');
    console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configurada' : '❌ NO configurada');
    console.log('  RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev (default)');
    console.log('  RESEND_RECIPIENT_EMAIL:', process.env.RESEND_RECIPIENT_EMAIL ? `✅ ${process.env.RESEND_RECIPIENT_EMAIL}` : '❌ NO configurada');
    console.log('');

    if (!process.env.RESEND_API_KEY) {
        console.error('❌ ERROR: RESEND_API_KEY no está configurada en .env');
        return;
    }

    if (!process.env.RESEND_RECIPIENT_EMAIL) {
        console.warn('⚠️ ADVERTENCIA: RESEND_RECIPIENT_EMAIL no está configurada. Las notificaciones no se enviarán.');
        console.log('   Agrega esta línea a tu archivo .env:');
        console.log('   RESEND_RECIPIENT_EMAIL=soportepeten@mineduc.edu.gt\n');
    }

    // 2. Probar conexión con Resend
    try {
        console.log('📧 Intentando enviar email de prueba...\n');

        const resend = new Resend(process.env.RESEND_API_KEY);

        const testRecipient = process.env.RESEND_RECIPIENT_EMAIL || 'test@example.com';

        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: [testRecipient],
            subject: '🧪 Prueba de Configuración - Sistema de Soporte Petén',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 4px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Configuración Exitosa</h1>
                        </div>
                        <div class="content">
                            <div class="success">
                                <strong>¡Éxito!</strong> Las notificaciones por email están funcionando correctamente.
                            </div>
                            <p>Este es un email de prueba del Sistema de Soporte Petén.</p>
                            <p><strong>Configuración actual:</strong></p>
                            <ul>
                                <li><strong>API Key:</strong> Configurada ✅</li>
                                <li><strong>Remitente:</strong> ${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}</li>
                                <li><strong>Destinatario:</strong> ${testRecipient}</li>
                            </ul>
                            <p>Si recibes este correo, significa que el sistema de notificaciones está funcionando correctamente.</p>
                            <hr/>
                            <p style="font-size: 12px; color: #666;">
                                Este es un correo automático de prueba. Por favor no responder.<br/>
                                Sistema de Soporte Petén - MINEDUC
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            console.error('❌ Error de Resend:', error);
            console.log('\n📝 Posibles causas:');
            console.log('  1. La API Key no es válida');
            console.log('  2. El email de destino no está verificado (Resend requiere verificación)');
            console.log('  3. Has excedido el límite de emails del plan gratuito');
            console.log('  4. El dominio del remitente no está verificado\n');
            return;
        }

        console.log('✅ Email enviado exitosamente!');
        console.log('📬 ID del mensaje:', data.id);
        console.log('📧 Destinatario:', testRecipient);
        console.log('\n✨ Las notificaciones están configuradas correctamente.\n');

    } catch (error) {
        console.error('❌ Error al enviar email:', error.message);
        console.log('\n📝 Verifica:');
        console.log('  1. Que la API Key sea correcta');
        console.log('  2. Que tengas conexión a internet');
        console.log('  3. Que el paquete "resend" esté instalado (npm install resend)\n');
    }
}

// Ejecutar prueba
testResend().then(() => {
    console.log('🏁 Prueba completada.');
}).catch(err => {
    console.error('💥 Error fatal:', err);
});
