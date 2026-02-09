const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:admin123@cluster0.7s48o.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

const fixIndexes = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('servicetypes');
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        // Find the index on 'nombre'
        const nameIndex = indexes.find(idx => idx.key.nombre === 1 && idx.unique === true && !idx.key.descripcion);

        if (nameIndex) {
            console.log(`Found conflicting index: ${nameIndex.name}. Dropping it...`);
            await collection.dropIndex(nameIndex.name);
            console.log('Index dropped successfully.');
        } else {
            console.log('No conflicting index found on "nombre" alone.');
        }

        console.log('Verifying indexes after operation...');
        const newIndexes = await collection.indexes();
        console.log('Updated Indexes:', newIndexes);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

fixIndexes();
