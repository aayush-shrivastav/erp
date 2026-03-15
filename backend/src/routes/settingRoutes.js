const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), getSettings);
router.put('/', authorize('SUPER_ADMIN'), updateSettings);

module.exports = router;
