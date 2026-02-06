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

// Solo Admin puede crear, actualizar y borrar (por ahora)
// Podríamos dejar que agentes creen las suyas propias, pero empezamos simple.
router.post('/', adminOnly, createCannedResponse);
router.put('/:id', adminOnly, updateCannedResponse);
router.delete('/:id', adminOnly, deleteCannedResponse);

module.exports = router;
