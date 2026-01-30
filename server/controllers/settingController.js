const Setting = require('../models/Setting');
const sendEmail = require('../utils/emailService');

// @desc    Obtener configuración
// @route   GET /api/settings
// @access  Private (Admin)
exports.getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Actualizar configuración
// @route   PUT /api/settings
// @access  Private (Admin)
exports.updateSettings = async (req, res) => {
    try {
        const settings = await Setting.findOne();
        if (!settings) {
            return res.status(404).json({ message: 'Error config no encontrada' });
        }

        Object.assign(settings, req.body);
        await settings.save();
        res.json(settings);
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
