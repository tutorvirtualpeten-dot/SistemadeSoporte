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

// @desc    Obtener estadísticas avanzadas del dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateFilter = {};

        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        // 1. Resumen General (KPIs)
        const totalTickets = await Ticket.countDocuments(dateFilter);
        const pendientes = await Ticket.countDocuments({ ...dateFilter, estado: 'abierto' });
        const enProceso = await Ticket.countDocuments({ ...dateFilter, estado: 'en_progreso' });
        const resueltos = await Ticket.countDocuments({ ...dateFilter, estado: { $in: ['resuelto', 'cerrado'] } });

        // 2. Tickets por Estado (Para Pie Chart)
        const ticketsByStatus = await Ticket.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$estado', count: { $sum: 1 } } }
        ]);

        // 3. Tickets por Prioridad (Para Bar Chart)
        const ticketsByPriority = await Ticket.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$prioridad', count: { $sum: 1 } } }
        ]);

        // 4. Tickets por Categoría (Para Bar Chart) - Requiere $lookup si category es ObjectId
        const ticketsByCategory = await Ticket.aggregate([
            { $match: dateFilter },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoria',
                    foreignField: '_id',
                    as: 'categoryParams'
                }
            },
            {
                $group: {
                    _id: { $arrayElemAt: ['$categoryParams.nombre', 0] }, // Agrupar por nombre de categoría
                    count: { $sum: 1 }
                }
            }
        ]);


        // 5. Tendencia Diaria (Para Line Chart)
        const dailyTrend = await Ticket.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            summary: {
                totalTickets,
                pendientes,
                enProceso,
                resueltos
            },
            charts: {
                byStatus: ticketsByStatus,
                byPriority: ticketsByPriority,
                byCategory: ticketsByCategory,
                dailyTrend: dailyTrend
            }
        });
    } catch (error) {
        console.error('Error dashboard stats:', error);
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
