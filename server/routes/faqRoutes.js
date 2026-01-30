const express = require('express');
const router = express.Router();
const { getFAQs, getAllFAQs, createFAQ, updateFAQ, deleteFAQ } = require('../controllers/faqController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getFAQs);

// Admin Routes
router.get('/admin', protect, adminOnly, getAllFAQs);
router.post('/admin', protect, adminOnly, createFAQ);
router.put('/admin/:id', protect, adminOnly, updateFAQ);
router.delete('/admin/:id', protect, adminOnly, deleteFAQ);

module.exports = router;
