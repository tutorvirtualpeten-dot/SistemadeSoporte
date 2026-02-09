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
    .then(async () => {
        console.log('✅ Conectado a MongoDB');
        // Crear admin por defecto si no existe
        const seedAdmin = require('./seed');
        await seedAdmin();
    })
    .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes'); // Missing file
const ticketRoutes = require('./routes/ticketRoutes');
const commentRoutes = require('./routes/commentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const settingRoutes = require('./routes/settingRoutes');
const faqRoutes = require('./routes/faqRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cannedResponseRoutes = require('./routes/cannedResponseRoutes');
const auditRoutes = require('./routes/auditRoutes');
// const reportRoutes = require('./routes/reportRoutes'); // Missing file
// const statsRoutes = require('./routes/statsRoutes'); // Missing file
const ticketSourceRoutes = require('./routes/ticketSourceRoutes');
const serviceTypeRoutes = require('./routes/serviceTypeRoutes');

app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/canned-responses', cannedResponseRoutes);
app.use('/api/audit', auditRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/stats', statsRoutes);
app.use('/api/ticket-sources', ticketSourceRoutes);
app.use('/api/service-types', serviceTypeRoutes);


app.get('/', (req, res) => {
    res.send('API de Soporte Petén funcionando correctamente 🚀');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server corriendo en http://localhost:${PORT}`);
});
