require('dotenv').config();
const { sendTicketNotification } = require('./utils/emailService');

/**
 * Script para probar notificaciones con múltiples destinatarios
 */
async function testMultipleRecipients() {
    console.log('📧 Probando sistema de múltiples destinatarios...\n');

    // Mostrar configuración actual
    const recipientString = process.env.RESEND_RECIPIENT_EMAIL;
    console.log('📋 Configuración actual:');
    console.log('  RESEND_RECIPIENT_EMAIL:', recipientString);

    if (recipientString) {
        const recipients = recipientString
            .split(',')
            .map(email => email.trim())
            .filter(email => email.length > 0);

        console.log(`  Total de destinatarios: ${recipients.length}`);
        recipients.forEach((email, index) => {
            console.log(`    ${index + 1}. ${email}`);
        });
    }
    console.log('');

    // Ticket de prueba
    const mockTicket = {
        ticket_id: 8888,
        titulo: 'Prueba de Múltiples Destinatarios',
        estado: 'abierto',
        prioridad: 'media',
        fecha_creacion: new Date(),
        datos_contacto: {
            nombre_completo: 'Sistema de Pruebas'
        }
    };

    console.log('📤 Enviando notificación de prueba...');
    const result = await sendTicketNotification('TICKET_CREATED', mockTicket);

    if (result) {
        console.log('✅ Notificación enviada exitosamente a todos los destinatarios\n');
    } else {
        console.log('❌ Error al enviar notificación\n');
    }

    console.log('🏁 Prueba completada.');
    console.log('\n💡 Para agregar más destinatarios, edita el archivo .env:');
    console.log('   RESEND_RECIPIENT_EMAIL=email1@example.com,email2@example.com,email3@example.com\n');
}

testMultipleRecipients().catch(err => {
    console.error('💥 Error:', err);
});
