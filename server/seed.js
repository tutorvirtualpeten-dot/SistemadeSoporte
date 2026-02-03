const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        const adminEmail = 'soportepeten@mineduc.edu.gt';
        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('⚠️ El usuario Super Admin ya existe.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Guatemala*2019', salt);

        await User.create({
            nombre: 'Super Administrador',
            email: adminEmail,
            password: hashedPassword,
            rol: 'super_admin',
            departamento: 'Dirección'
        });

        console.log('🎉 Usuario Super Admin creado correctamente');
        console.log(`📧 Email: ${adminEmail}`);
    } catch (error) {
        console.error('❌ Error creando admin:', error);
    }
};

module.exports = seedAdmin;
