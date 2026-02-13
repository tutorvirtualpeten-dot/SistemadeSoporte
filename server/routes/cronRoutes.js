const express = require('express');
const router = express.Router();
const cronController = require('../controllers/cronController');

router.get('/check-sla', cronController.checkSLABreach);

module.exports = router;
