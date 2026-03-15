const express = require('express');
const { createFaculty, getFaculty, assignSubjects, getMe, getMyAssignments, getMyTimetable, updateFaculty, deleteFaculty } = require('../controllers/facultyController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/me', authorize('FACULTY'), getMe);
router.get('/my-assignments', authorize('FACULTY'), getMyAssignments);
router.get('/my-timetable', authorize('FACULTY'), getMyTimetable);

router.route('/')
    .post(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), createFaculty)
    .get(getFaculty);

router.route('/:id')
    .put(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), updateFaculty)
    .delete(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), deleteFaculty);

router.put('/:id/assign', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), assignSubjects);

module.exports = router;
