require('dotenv').config();
const { sendTicketNotification } = require('./utils/emailService');

/**
 * Script para probar las notificaciones de tickets
 */
async function testTicketNotifications() {
    console.log('🎫 Probando notificaciones de tickets...\n');

    // Ticket de prueba simulado
    const mockTicket = {
        ticket_id: 9999,
        titulo: 'Prueba de Notificación - Sistema de Soporte',
        estado: 'abierto',
        prioridad: 'alta',
        fecha_creacion: new Date(),
        datos_contacto: {
            nombre_completo: 'Usuario de Prueba'
        }
    };

    console.log('📧 Enviando notificación de TICKET_CREATED...');
    const result1 = await sendTicketNotification('TICKET_CREATED', mockTicket);
    console.log(result1 ? '✅ Enviada correctamente\n' : '❌ Falló el envío\n');

    console.log('📧 Enviando notificación de AGENT_ASSIGNED...');
    const result2 = await sendTicketNotification('AGENT_ASSIGNED', mockTicket, {
        agentName: 'Juan Pérez (Agente de Prueba)'
    });
    console.log(result2 ? '✅ Enviada correctamente\n' : '❌ Falló el envío\n');

    console.log('📧 Enviando notificación de STATUS_CHANGED...');
    const result3 = await sendTicketNotification('STATUS_CHANGED', mockTicket, {
        oldStatus: 'abierto',
        newStatus: 'en_progreso'
    });
    console.log(result3 ? '✅ Enviada correctamente\n' : '❌ Falló el envío\n');

    console.log('🏁 Prueba completada.');
    console.log('\n📬 Revisa la bandeja de entrada de:', process.env.RESEND_RECIPIENT_EMAIL);
    console.log('   Deberías haber recibido 3 emails de notificación.\n');
}

testTicketNotifications().catch(err => {
    console.error('💥 Error:', err);
});
