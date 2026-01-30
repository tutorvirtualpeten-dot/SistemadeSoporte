const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soporte_peten_db';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));



app.get('/', (req, res) => {
    res.send('API de Soporte Petén funcionando correctamente 🚀');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server corriendo en http://localhost:${PORT}`);
});
