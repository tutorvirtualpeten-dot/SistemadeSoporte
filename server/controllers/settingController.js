const Setting = require('../models/Setting');
const sendEmail = require('../utils/emailService');
const logSystem = require('../utils/systemLogger');

// @desc    Obtener configuración
// @route   GET /api/settings
// @access  Public (Partial) / Private (Full)
exports.getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({});
        }

        // Lazy migration: Inicializar modulos si no existen
        if (!settings.modulos) {
            settings.modulos = {
                tickets: ['admin', 'agente'],
                users: [],
                categories: ['admin'],
                faqs: ['admin'],
                responses: ['admin', 'agente'],
                catalogs: ['admin', 'agente'],
                audit: [],
                settings: ['admin']
            };
            await settings.save();
        }

        // Lazy migration: Inicializar SLA
        if (!settings.sla || !settings.sla.critica) {
            settings.sla = {
                critica: 4,
                alta: 24,
                media: 72,
                baja: 168
            };
            await settings.save();
        }

        const publicSettings = {
            nombre_app: settings.nombre_app,
            logo_url: settings.logo_url
        };

        // Si hay usuario y es staff, retornar configuración completa (menos passwords si se requiere)
        if (req.user && ['admin', 'super_admin', 'agente'].includes(req.user.rol)) {
            return res.json({
                ...publicSettings,
                smtp_config: settings.smtp_config, // Cuidado: No exponer pass en producción idealmente
                modulos: settings.modulos
            });
        }

        // Retornar solo datos públicos para login/visitantes
        res.json(publicSettings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Actualizar configuración
// @route   PUT /api/settings
// @access  Private (Admin)
exports.updateSettings = async (req, res) => {
    try {
        // Object.assign(settings, req.body);
        // const updated = await settings.save();

        // remove _id and __v to avoid immutable field error
        const { _id, __v, ...updateData } = req.body;

        // Use findOneAndUpdate for atomic/safer update
        const updated = await Setting.findOneAndUpdate(
            {},
            { $set: updateData },
            { new: true, upsert: true }
        );

        console.log('Settings updated via findOneAndUpdate:', updated);

        await logSystem(req.user._id, 'UPDATE_SETTINGS', { changes: req.body }, req);

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Probar envío de correo
// @route   POST /api/settings/test-email
// @access  Private (Admin)
exports.testEmail = async (req, res) => {
    try {
        const userEmail = req.user.email;
        if (!userEmail) {
            return res.status(400).json({ message: 'Usuario no tiene email.' });
        }

        await sendEmail({
            to: userEmail,
            subject: 'Prueba de Conexión SMTP - Soporte Petén',
            text: '¡Hola! Si ves este correo, la configuración SMTP es correcta.',
            html: '<h3>¡Éxito!</h3><p>La configuración SMTP funciona correctamente.</p>'
        });

        res.json({ message: `Correo de prueba enviado a ${userEmail}` });

    } catch (error) {
        console.error('Test Email Error:', error);
        res.status(500).json({ message: error.message || 'Error al enviar correo' });
    }
};
