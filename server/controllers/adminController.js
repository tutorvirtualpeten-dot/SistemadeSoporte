const User = require('../models/User');
const Ticket = require('../models/Ticket');
const bcrypt = require('bcryptjs');

// @desc    Obtener todos los usuarios
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear usuario (Técnico/Admin)
// @route   POST /api/admin/users
// @access  Private (Admin)
exports.createUser = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Usuario ya existe' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            nombre,
            email,
            password: hashedPassword,
            rol
        });

        res.status(201).json({
            _id: user._id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Borrar usuario
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Actualizar usuario
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.nombre = req.body.nombre || user.nombre;
        user.email = req.body.email || user.email;
        user.rol = req.body.rol || user.rol;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            nombre: updatedUser.nombre,
            email: updatedUser.email,
            rol: updatedUser.rol
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener estadísticas del dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
    try {
        const totalTickets = await Ticket.countDocuments();
        const pendientes = await Ticket.countDocuments({ estado: 'abierto' });
        const enProceso = await Ticket.countDocuments({ estado: 'en_progreso' });
        const resueltos = await Ticket.countDocuments({ estado: { $in: ['resuelto', 'cerrado'] } });

        res.json({
            totalTickets,
            pendientes,
            enProceso,
            resueltos
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Obtener lista de agentes (para asignar)
// @route   GET /api/admin/agents
// @access  Private (Admin)
exports.getAgents = async (req, res) => {
    try {
        const agents = await User.find({
            rol: { $in: ['agente', 'admin', 'super_admin'] }
        }).select('_id nombre email');
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
