require('dotenv').config();
const { Resend } = require('resend');

console.log('\n🔍 VERIFICACIÓN DE CONFIGURACIÓN DE EMAIL\n');
console.log('='.repeat(50));

// 1. Verificar variables de entorno
console.log('\n📋 Variables de Entorno:');
console.log('-'.repeat(50));

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;
const recipientEmail = process.env.RESEND_RECIPIENT_EMAIL;

console.log(`✓ RESEND_API_KEY: ${apiKey ? '✅ Configurada (' + apiKey.substring(0, 10) + '...)' : '❌ NO configurada'}`);
console.log(`✓ RESEND_FROM_EMAIL: ${fromEmail ? '✅ ' + fromEmail : '❌ NO configurada'}`);
console.log(`✓ RESEND_RECIPIENT_EMAIL: ${recipientEmail ? '✅ ' + recipientEmail : '❌ NO configurada'}`);

// 2. Verificar que todas las variables estén configuradas
if (!apiKey || !fromEmail || !recipientEmail) {
    console.log('\n❌ ERROR: Faltan variables de entorno en el archivo .env');
    console.log('\nAsegúrate de tener estas variables en tu archivo .env:');
    console.log('  RESEND_API_KEY=tu_api_key');
    console.log('  RESEND_FROM_EMAIL=onboarding@resend.dev');
    console.log('  RESEND_RECIPIENT_EMAIL=soportepeten@mineduc.edu.gt');
    process.exit(1);
}

// 3. Intentar enviar un email de prueba
async function testEmailSending() {
    try {
        console.log('\n📧 Intentando enviar email de prueba...');
        console.log('-'.repeat(50));

        const resend = new Resend(apiKey);

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: recipientEmail,
            subject: '✅ Prueba de Configuración - Sistema de Soporte Petén',
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
                        .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 4px; margin: 20px 0; }
                        .info-box { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 4px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Configuración Exitosa</h1>
                        </div>
                        <div class="content">
                            <div class="success-box">
                                <strong>✅ ¡Email de Prueba Enviado Correctamente!</strong>
                            </div>
                            
                            <p>Este email confirma que la configuración de Resend está funcionando correctamente.</p>
                            
                            <div class="info-box">
                                <p><strong>📋 Detalles de la Configuración:</strong></p>
                                <ul>
                                    <li><strong>API Key:</strong> ${apiKey.substring(0, 10)}...</li>
                                    <li><strong>Remitente:</strong> ${fromEmail}</li>
                                    <li><strong>Destinatario:</strong> ${recipientEmail}</li>
                                    <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-GT')}</li>
                                </ul>
                            </div>
                            
                            <p>El sistema de notificaciones por email está listo para usarse.</p>
                            
                            <div class="footer">
                                <p>Este es un correo automático de prueba. Por favor no responder.</p>
                                <p>Sistema de Soporte Petén - MINEDUC</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            console.log('\n❌ Error al enviar email:');
            console.error(error);
            console.log('\n💡 Posibles causas:');
            console.log('  - API Key inválida o expirada');
            console.log('  - Email remitente no verificado en Resend');
            console.log('  - Límite de envíos alcanzado');
            return false;
        }

        console.log('\n✅ Email enviado exitosamente!');
        console.log(`   ID del email: ${data.id}`);
        console.log(`   Destinatario: ${recipientEmail}`);
        console.log('\n📬 Revisa la bandeja de entrada de: ' + recipientEmail);
        console.log('   (También revisa la carpeta de spam si no lo ves)');

        return true;

    } catch (error) {
        console.log('\n❌ Error inesperado:');
        console.error(error);
        return false;
    }
}

// 4. Ejecutar la prueba
testEmailSending().then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
        console.log('✅ VERIFICACIÓN COMPLETA - Todo funciona correctamente');
        console.log('\n📝 Próximos pasos:');
        console.log('  1. Confirma que recibiste el email de prueba');
        console.log('  2. Configura las mismas variables en Vercel:');
        console.log('     - Ve a tu proyecto en Vercel');
        console.log('     - Settings → Environment Variables');
        console.log('     - Agrega: RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_RECIPIENT_EMAIL');
        console.log('  3. Redeploy tu aplicación en Vercel');
    } else {
        console.log('❌ VERIFICACIÓN FALLIDA - Revisa los errores arriba');
    }
    console.log('='.repeat(50) + '\n');
});
