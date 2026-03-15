const express = require('express');
const { updateAttendanceSettings, getOverallAttendanceReports, takeAttendance, getMyAttendance, getAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN', 'FACULTY'), getAttendance);
router.post('/', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN', 'FACULTY'), takeAttendance);
router.patch('/settings', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), updateAttendanceSettings);
router.get('/reports', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN', 'FACULTY'), getOverallAttendanceReports);

router.get('/my-attendance', authorize('STUDENT'), getMyAttendance);

module.exports = router;
