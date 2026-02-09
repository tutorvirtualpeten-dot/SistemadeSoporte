const express = require('express');
const router = express.Router();
const {
    getServiceTypes,
    createServiceType,
    updateServiceType,
    deleteServiceType
} = require('../controllers/serviceTypeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getServiceTypes)
    .post(protect, authorize('admin', 'super_admin'), createServiceType);

router.route('/:id')
    .put(protect, authorize('admin', 'super_admin'), updateServiceType)
    .delete(protect, authorize('admin', 'super_admin'), deleteServiceType);

module.exports = router;
