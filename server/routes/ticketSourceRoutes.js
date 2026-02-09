const express = require('express');
const router = express.Router();
const {
    getTicketSources,
    createTicketSource,
    updateTicketSource,
    deleteTicketSource
} = require('../controllers/ticketSourceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getTicketSources)
    .post(protect, authorize('admin', 'super_admin'), createTicketSource);

router.route('/:id')
    .put(protect, authorize('admin', 'super_admin'), updateTicketSource)
    .delete(protect, authorize('admin', 'super_admin'), deleteTicketSource);

module.exports = router;
