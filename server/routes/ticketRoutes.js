const express = require('express');
const router = express.Router();
const {
    createTicket,
    getTickets,
    getTicketById,
    updateTicket,
    deleteTicket,
    getTicketStatus,
    addPublicComment,
    rateTicket
} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const { optionalAuth } = require('../middleware/optionalAuth');

router.get('/status/:id', getTicketStatus); // Ruta pública de consulta
router.post('/public/comment/:id', addPublicComment); // Ruta pública de comentario
router.put('/public/rate/:id', rateTicket); // Ruta pública de calificación

router.route('/')
    .get(protect, getTickets)
    .post(optionalAuth, createTicket);

router.route('/:id')
    .get(protect, getTicketById)
    .put(protect, updateTicket)
    .delete(protect, deleteTicket);

module.exports = router;
