const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const fixIndexes = async () => {
    try {
        console.log('Conectando a MongoDB para corregir índices...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conectado.');

        const Ticket = require('./models/Ticket');

        console.log('Intentando eliminar índice ticket_id_1 antiguo...');
        try {
            await mongoose.connection.collection('tickets').dropIndex('ticket_id_1');
            console.log('✅ Índice eliminado con éxito. Se recreará automáticamente con la nueva configuración (sparse) al reiniciar el servidor.');
        } catch (error) {
            if (error.codeName === 'IndexNotFound') {
                console.log('ℹ️ El índice no existía, no es necesario eliminarlo.');
            } else {
                console.log('⚠️ Aviso:', error.message);
            }
        }

        process.exit();
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
};

fixIndexes();
