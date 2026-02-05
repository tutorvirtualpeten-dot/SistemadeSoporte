const mongoose = require('mongoose');
const Setting = require('./models/Setting');
require('dotenv').config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/soporte_peten_db';
        await mongoose.connect(uri);
        console.log('MongoDB Connected to', uri);

        const count = await Setting.countDocuments();
        console.log(`Total Settings Documents: ${count}`);

        const settings = await Setting.find();
        console.log(JSON.stringify(settings, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
