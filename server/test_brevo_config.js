require('dotenv').config();
const { sendTicketNotification } = require('./utils/emailService');

console.log('\n🔍 VERIFICACIÓN DE CONFIGURACIÓN DE BREVO\n');
console.log('='.repeat(50));

// 1. Verificar variables de entorno
console.log('\n📋 Variables de Entorno:');
console.log('-'.repeat(50));

const apiKey = process.env.BREVO_API_KEY;
const fromEmail = process.env.BREVO_FROM_EMAIL;
const fromName = process.env.BREVO_FROM_NAME;
const recipientEmail = process.env.BREVO_RECIPIENT_EMAIL;

console.log(`✓ BREVO_API_KEY: ${apiKey ? '✅ Configurada (' + apiKey.substring(0, 15) + '...)' : '❌ NO configurada'}`);
console.log(`✓ BREVO_FROM_EMAIL: ${fromEmail ? '✅ ' + fromEmail : '❌ NO configurada'}`);
console.log(`✓ BREVO_FROM_NAME: ${fromName ? '✅ ' + fromName : '⚠️ NO configurada (usará default)'}`);
console.log(`✓ BREVO_RECIPIENT_EMAIL: ${recipientEmail ? '✅ ' + recipientEmail : '❌ NO configurada'}`);

// 2. Verificar que todas las variables estén configuradas
if (!apiKey || !fromEmail || !recipientEmail) {
    console.log('\n❌ ERROR: Faltan variables de entorno en el archivo .env');
    console.log('\nAsegúrate de tener estas variables en tu archivo .env:');
    console.log('  BREVO_API_KEY=xkeysib-...');
    console.log('  BREVO_FROM_EMAIL=informaticapeten@gmail.com');
    console.log('  BREVO_FROM_NAME=Soporte Petén - MINEDUC');
    console.log('  BREVO_RECIPIENT_EMAIL=informaticapeten@gmail.com');
    process.exit(1);
}

// 3. Intentar enviar un email de prueba
async function testEmailSending() {
    try {
        console.log('\n📧 Intentando enviar email de prueba...');
        console.log('-'.repeat(50));

        // Crear un ticket de prueba
        const ticketPrueba = {
            ticket_id: 9999,
            titulo: 'Prueba de Configuración - Brevo',
            estado: 'abierto',
            prioridad: 'media',
            fecha_creacion: new Date(),
            datos_contacto: {
                nombre_completo: 'Usuario de Prueba'
            }
        };

        const success = await sendTicketNotification('TICKET_CREATED', ticketPrueba);

        if (success) {
            console.log('\n✅ Email enviado exitosamente!');
            console.log(`   Destinatario: ${recipientEmail}`);
            console.log('\n📬 Revisa la bandeja de entrada de: ' + recipientEmail);
            console.log('   (También revisa la carpeta de spam si no lo ves)');
            console.log('\n💡 También puedes verificar en el dashboard de Brevo:');
            console.log('   https://app.brevo.com/email/campaign/list');
            return true;
        } else {
            console.log('\n❌ Error al enviar email');
            console.log('\n💡 Posibles causas:');
            console.log('  - API Key inválida o expirada');
            console.log('  - Email remitente no verificado en Brevo');
            console.log('  - Límite de envíos alcanzado (300/día)');
            console.log('  - Problema de conexión a internet');
            return false;
        }

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
        console.log('  2. Reactivar las notificaciones en ticketController.js');
        console.log('  3. Configurar las mismas variables en Vercel:');
        console.log('     - Ve a tu proyecto en Vercel');
        console.log('     - Settings → Environment Variables');
        console.log('     - Agrega: BREVO_API_KEY, BREVO_FROM_EMAIL, BREVO_FROM_NAME, BREVO_RECIPIENT_EMAIL');
        console.log('  4. Redeploy tu aplicación en Vercel');
    } else {
        console.log('❌ VERIFICACIÓN FALLIDA - Revisa los errores arriba');
        console.log('\n💡 Ayuda:');
        console.log('  - Verifica que el email remitente esté verificado en Brevo');
        console.log('  - Revisa tu dashboard de Brevo para más detalles');
        console.log('  - Asegúrate de que la API key sea correcta');
    }
    console.log('='.repeat(50) + '\n');
});
