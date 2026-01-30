const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soporte_peten_db';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Conectado a MongoDB');
        const users = await User.find({}).select('nombre email rol');
        console.log('All Users:', users);

        const agents = await User.find({
            rol: { $in: ['agente', 'admin', 'super_admin'] }
        }).select('_id nombre email rol');
        console.log('Eligible Agents:', agents);

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
