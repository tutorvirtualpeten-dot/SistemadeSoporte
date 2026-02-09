const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const createTestAdmin = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soporte_peten_db';
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'antigravity_test@test.com';
        await User.findOneAndDelete({ email }); // Ensure clean state

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('test1234', salt);

        await User.create({
            nombre: 'Antigravity Test',
            email,
            password,
            rol: 'super_admin',
            departamento: 'IT'
        });

        console.log('✅ Temporary Admin Created');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createTestAdmin();
