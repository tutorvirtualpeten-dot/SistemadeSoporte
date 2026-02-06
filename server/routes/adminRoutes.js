const express = require('express');
const router = express.Router();
const { getUsers, createUser, deleteUser, updateUser, getDashboardStats, getAgents } = require('../controllers/adminController');
const { protect, adminOnly, superAdminOnly, agentOrAdmin } = require('../middleware/authMiddleware');

router.use(protect);

// Rutas accesibles por Admin y Super Admin (y Agentes para stats)
router.get('/stats', agentOrAdmin, getDashboardStats);
router.get('/agents', adminOnly, getAgents);

// Rutas exclusivas de Super Admin (Gestión de Usuarios)
router.route('/users')
    .get(superAdminOnly, getUsers)
    .post(superAdminOnly, createUser);

router.route('/users/:id')
    .put(superAdminOnly, updateUser)
    .delete(superAdminOnly, deleteUser);

module.exports = router;
