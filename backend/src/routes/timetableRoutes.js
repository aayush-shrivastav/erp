const express = require('express');
const { createTimeSlot, getSectionTimetable, getTimetables, updateTimeSlot, deleteTimeSlot } = require('../controllers/timetableController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), createTimeSlot);
router.get('/', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN', 'FACULTY'), getTimetables);
router.get('/section/:sectionId', getSectionTimetable);
router.route('/:id')
    .put(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), updateTimeSlot)
    .delete(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), deleteTimeSlot);

module.exports = router;
