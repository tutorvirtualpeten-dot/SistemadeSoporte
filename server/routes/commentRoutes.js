const express = require('express');
const router = express.Router();
const { addComment, getCommentsByTicket } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addComment);
router.get('/:ticketId', protect, getCommentsByTicket);

module.exports = router;
