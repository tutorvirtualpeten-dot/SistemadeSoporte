const mongoose = require('mongoose');
require('dotenv').config();
const Setting = require('./models/Setting');
const Ticket = require('./models/Ticket');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Create/Update Settings
        let settings = await Setting.findOne();
        if (!settings) settings = await Setting.create({});

        settings.sla = {
            critica: 5, // Test value
            alta: 25,
            media: 75,
            baja: 170
        };
        await settings.save();
        console.log('Settings updated with test SLA values:', settings.sla);

        // 2. Create Ticket
        const ticket = new Ticket({
            titulo: 'Test SLA Ticket',
            descripcion: 'Testing dynamic SLA',
            prioridad: 'critica', // Should be +5 hours
            tipo_usuario: 'docente',
            datos_contacto: { nombre_completo: 'Tester', email: 'test@example.com' }
        });

        // Trigger pre-save hook
        await ticket.save();
        console.log('Ticket created:', ticket._id);
        console.log('Ticket Priority:', ticket.prioridad);
        console.log('Ticket Created At:', ticket.fecha_creacion);
        console.log('Ticket SLA Due Date:', ticket.fecha_limite_resolucion);

        // Verify
        const diffHours = (ticket.fecha_limite_resolucion - ticket.fecha_creacion) / (1000 * 60 * 60);
        console.log('Difference in hours:', diffHours);

        if (Math.abs(diffHours - 5) < 0.1) {
            console.log('SUCCESS: SLA calculation matches configured value (5 hours)');
        } else {
            console.error('FAILURE: SLA calculation mismatch');
        }

        // Cleanup
        await Ticket.findByIdAndDelete(ticket._id);

        // Restore default for safety? 
        // Maybe not needed if user is going to config anyway. 
        // But let's set back to defaults to avoid confusion
        settings.sla = {
            critica: 4,
            alta: 24,
            media: 72,
            baja: 168
        };
        await settings.save();
        console.log('Settings restored to defaults');

    } catch (error) {
        console.error('VERIFICATION FAILED:', error.message);
        if (error.errors) console.error('Validation Errors:', JSON.stringify(error.errors, null, 2));
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

run();
