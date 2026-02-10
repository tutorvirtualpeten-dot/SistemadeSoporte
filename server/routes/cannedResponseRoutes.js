const express = require('express');
const router = express.Router();
const {
    getCannedResponses,
    createCannedResponse,
    deleteCannedResponse,
    updateCannedResponse
} = require('../controllers/cannedResponseController');
const { protect, adminOnly, agentOrAdmin } = require('../middleware/authMiddleware');

// Todo el endpoint requiere autenticación
router.use(protect);

// Admin y Agentes pueden ver
router.get('/', agentOrAdmin, getCannedResponses);

// Ahora Agentes también pueden crear/editar/borrar (el controlador valida propiedad)
router.post('/', agentOrAdmin, createCannedResponse);
router.put('/:id', agentOrAdmin, updateCannedResponse);
router.delete('/:id', agentOrAdmin, deleteCannedResponse);

module.exports = router;
