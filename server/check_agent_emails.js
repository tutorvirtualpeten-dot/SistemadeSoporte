require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

/**
 * Script para verificar qué agentes recibirán notificaciones por email
 */
async function checkAgentEmails() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soporte_peten_db');
        console.log('✅ Conectado a MongoDB\n');

        // Buscar todos los usuarios que recibirán notificaciones
        const recipients = await User.find({
            rol: { $in: ['admin', 'super_admin', 'agente'] }
        }).select('nombre email rol');

        console.log('📧 USUARIOS QUE RECIBIRÁN NOTIFICACIONES POR EMAIL:\n');
        console.log('═'.repeat(80));

        if (recipients.length === 0) {
            console.log('❌ No se encontraron agentes, admins o super_admins en la base de datos.\n');
        } else {
            recipients.forEach((user, index) => {
                console.log(`${index + 1}. ${user.nombre}`);
                console.log(`   Rol: ${user.rol.toUpperCase()}`);
                console.log(`   Email: ${user.email || '❌ SIN EMAIL CONFIGURADO'}`);
                console.log(`   Estado: ${user.email ? '✅ Recibirá notificaciones' : '⚠️ NO recibirá notificaciones (falta email)'}`);
                console.log('─'.repeat(80));
            });

            console.log(`\n📊 RESUMEN:`);
            console.log(`   Total de usuarios: ${recipients.length}`);
            console.log(`   Con email configurado: ${recipients.filter(u => u.email).length}`);
            console.log(`   Sin email: ${recipients.filter(u => !u.email).length}`);
        }

        console.log('\n📧 ADEMÁS, se enviará notificación a:');
        console.log(`   RESEND_RECIPIENT_EMAIL: ${process.env.RESEND_RECIPIENT_EMAIL || '❌ NO CONFIGURADO'}`);

        console.log('\n💡 IMPORTANTE:');
        console.log('   Cuando se crea un ticket, TODOS los usuarios listados arriba');
        console.log('   recibirán un email individual + el email centralizado a RESEND_RECIPIENT_EMAIL\n');

        await mongoose.connection.close();
        console.log('✅ Conexión cerrada');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAgentEmails();
