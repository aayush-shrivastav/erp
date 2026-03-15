const express = require('express');
const { createFaculty, getFaculty, assignSubjects, getMe, getMyAssignments, getMyTimetable, updateFaculty, deleteFaculty } = require('../controllers/facultyController');
const { protect, authorize } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validate');
const { paginate } = require('../middlewares/paginate');
const { createFacultySchema, updateFacultySchema } = require('../validators/facultyValidator');

const router = express.Router();

router.use(protect);

router.get('/me', authorize('FACULTY'), getMe);
router.get('/my-assignments', authorize('FACULTY'), getMyAssignments);
router.get('/my-timetable', authorize('FACULTY'), getMyTimetable);

router.route('/')
    .post(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), validateRequest(createFacultySchema), createFaculty)
    .get(paginate, getFaculty);

router.route('/:id')
    .put(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), validateRequest(updateFacultySchema), updateFaculty)
    .delete(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), deleteFaculty);

router.put('/:id/assign', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), assignSubjects);

module.exports = router;
