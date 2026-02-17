require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function listAgents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soporte_peten_db');

        const users = await User.find({
            rol: { $in: ['admin', 'super_admin', 'agente'] }
        }).select('nombre email rol');

        console.log('\n=== AGENTES Y ADMINS QUE RECIBIRAN NOTIFICACIONES ===\n');

        users.forEach((user, i) => {
            console.log(`${i + 1}. ${user.nombre}`);
            console.log(`   Rol: ${user.rol}`);
            console.log(`   Email: ${user.email || 'SIN EMAIL'}`);
            console.log(`   Notificaciones: ${user.email ? 'SI' : 'NO'}\n`);
        });

        console.log(`Total: ${users.length} usuarios`);
        console.log(`Con email: ${users.filter(u => u.email).length}`);
        console.log(`\nAdicional: ${process.env.RESEND_RECIPIENT_EMAIL}\n`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listAgents();
