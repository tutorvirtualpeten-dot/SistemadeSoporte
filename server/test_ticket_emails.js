require('dotenv').config();
const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
const User = require('./models/User');
const sendEmail = require('./utils/emailService');
const { sendTicketNotification } = require('./utils/emailService');

/**
 * Script para simular la creación de un ticket y ver si se envían los emails
 */
async function testTicketEmails() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soporte_peten_db');
        console.log('✅ Conectado a MongoDB\n');

        // Buscar agentes/admins
        const admins = await User.find({ rol: { $in: ['admin', 'super_admin', 'agente'] } });
        console.log(`📋 Encontrados ${admins.length} agentes/admins:\n`);

        admins.forEach((admin, i) => {
            console.log(`${i + 1}. ${admin.nombre}`);
            console.log(`   Email: ${admin.email || '❌ SIN EMAIL'}`);
            console.log(`   Rol: ${admin.rol}\n`);
        });

        // Simular un ticket
        const mockTicket = {
            ticket_id: 9999,
            titulo: 'Prueba de Emails',
            estado: 'abierto',
            prioridad: 'alta',
            fecha_creacion: new Date(),
            datos_contacto: {
                nombre_completo: 'Usuario de Prueba'
            }
        };

        console.log('📧 Intentando enviar emails a cada agente/admin...\n');

        let emailsSent = 0;
        let emailsFailed = 0;

        for (const admin of admins) {
            if (admin.email) {
                console.log(`Enviando a: ${admin.nombre} (${admin.email})`);

                try {
                    await sendEmail({
                        to: admin.email,
                        subject: `PRUEBA - Nuevo Ticket #${mockTicket.ticket_id}`,
                        html: `<p>Hola <strong>${admin.nombre}</strong>,</p>
                               <p>Este es un email de PRUEBA del sistema de notificaciones.</p>
                               <p>Si recibes este email, significa que las notificaciones están funcionando.</p>`
                    });
                    console.log(`   ✅ Email enviado exitosamente\n`);
                    emailsSent++;
                } catch (error) {
                    console.error(`   ❌ Error: ${error.message}\n`);
                    emailsFailed++;
                }
            } else {
                console.log(`⚠️ ${admin.nombre} no tiene email configurado\n`);
            }
        }

        console.log('═'.repeat(60));
        console.log(`📊 RESUMEN:`);
        console.log(`   Emails enviados: ${emailsSent}`);
        console.log(`   Emails fallidos: ${emailsFailed}`);
        console.log(`   Sin email: ${admins.length - emailsSent - emailsFailed}`);
        console.log('═'.repeat(60));

        // Probar notificación centralizada
        console.log('\n📧 Probando notificación centralizada...');
        console.log(`   Destinatario: ${process.env.RESEND_RECIPIENT_EMAIL || '❌ NO CONFIGURADO'}\n`);

        if (process.env.RESEND_RECIPIENT_EMAIL) {
            const result = await sendTicketNotification('TICKET_CREATED', mockTicket);
            console.log(result ? '   ✅ Notificación centralizada enviada' : '   ❌ Falló notificación centralizada');
        }

        await mongoose.connection.close();
        console.log('\n✅ Prueba completada\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testTicketEmails();
