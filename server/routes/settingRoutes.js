const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminOnly);

router.route('/')
    .get(getSettings)
    .put(updateSettings);

router.post('/test-email', require('../controllers/settingController').testEmail);

module.exports = router;
