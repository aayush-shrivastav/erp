const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.get('/stats', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), getDashboardStats);

module.exports = router;
