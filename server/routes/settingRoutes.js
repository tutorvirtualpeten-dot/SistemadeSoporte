const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getSettings);
router.put('/', protect, adminOnly, updateSettings);

router.post('/test-email', protect, adminOnly, require('../controllers/settingController').testEmail);

module.exports = router;
