const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const makeSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/soporte_peten_db');
        console.log('MongoDB Conectado');

        const users = await User.find({});
        console.log('Usuarios en DB:', users);

        const email = 'admin@soporte.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`Usuario ${email} no encontrado`);
            process.exit(1);
        }

        user.rol = 'super_admin';
        await user.save();

        console.log(`¡Éxito! El usuario ${user.nombre} (${user.email}) ahora es SUPER ADMINISTRADOR.`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

makeSuperAdmin();
