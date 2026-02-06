const express = require('express');
const router = express.Router();
const SystemLog = require('../models/SystemLog');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(superAdminOnly); // Only Super Admin can see audit logs

// @desc    Get system logs
// @route   GET /api/audit
// @access  Super Admin
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const logs = await SystemLog.find()
            .populate('usuario_id', 'nombre email rol')
            .sort({ fecha: -1 })
            .skip(skip)
            .limit(limit);

        const total = await SystemLog.countDocuments();

        res.json({
            logs,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
