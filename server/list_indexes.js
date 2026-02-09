const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:admin123@cluster0.7s48o.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

const listIndexes = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('servicetypes');
        const indexes = await collection.indexes();
        console.log('CURRENT INDEXES:');
        console.log(JSON.stringify(indexes, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

listIndexes();
