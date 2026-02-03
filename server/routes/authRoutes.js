const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// router.post('/register', register); // Registro deshabilitado por seguridad
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
