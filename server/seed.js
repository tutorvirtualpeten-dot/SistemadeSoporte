const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soporte_peten_db';

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        const adminEmail = 'admin@soporte.com';
        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('⚠️ El usuario admin ya existe.');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const adminUser = await User.create({
            nombre: 'Administrador Principal',
            email: adminEmail,
            password: hashedPassword,
            rol: 'admin',
            departamento: 'TI'
        });

        console.log('🎉 Usuario Admin creado correctamente');
        console.log('📧 Email: admin@soporte.com');
        console.log('🔑 Pass: admin123');

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedAdmin();
