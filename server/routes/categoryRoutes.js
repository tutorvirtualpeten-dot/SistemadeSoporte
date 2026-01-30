const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route for fetching (needed for dropdowns)
// or maybe protected? Usually dropdowns need to be accessible. 
// Let's make GET public for now or assume token presence if inside portal.
// For public form, we might need it open.
router.get('/', getCategories);

router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
