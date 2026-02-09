const mongoose = require('mongoose');
// Remove dotenv since we can use hardcoded URI if needed and it seems to cause noise
const MONGO_URI = "mongodb+srv://admin:admin123@cluster0.7s48o.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

const listIndexes = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const collection = mongoose.connection.collection('servicetypes');
        const indexes = await collection.indexes();
        console.log('JSON: ' + JSON.stringify(indexes));
    } catch (error) {
        console.error('ERR: ' + error.message);
    } finally {
        await mongoose.disconnect();
    }
};

listIndexes();
