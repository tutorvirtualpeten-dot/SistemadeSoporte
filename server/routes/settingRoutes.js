const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getSettings);
router.put('/', protect, adminOnly, updateSettings);

router.post('/test-email', protect, adminOnly, require('../controllers/settingController').testEmail);

module.exports = router;
