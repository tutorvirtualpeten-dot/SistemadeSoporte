const mongoose = require('mongoose');
const Category = require('./models/Category');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soporte_peten_db';

(async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ DB Conectada');

        const testName = 'Test Category ' + Date.now();
        console.log(`Intentando crear categoría: ${testName}`);

        const cat = await Category.create({
            nombre: testName,
            tipo: 'docente',
            activo: true
        });

        console.log('✅ Categoría creada exitosamente:', cat);

        // Limpiar
        await Category.findByIdAndDelete(cat._id);
        console.log('✅ Categoría de prueba eliminada');

    } catch (error) {
        console.error('❌ ERROR CREANDO CATEGORÍA:', error);
    } finally {
        await mongoose.disconnect();
    }
})();
