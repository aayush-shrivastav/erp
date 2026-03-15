const express = require('express');
const { createOrUpdateMarks, getMarks, lockMarks, getMyMarks, getTeacherClasses, getGroupStudents, finalizeSubjectMarks } = require('../controllers/markController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN', 'FACULTY'), createOrUpdateMarks)
    .get(getMarks);

router.get('/teacher/classes', authorize('FACULTY'), getTeacherClasses);
router.get('/group/:groupId/students', authorize('FACULTY'), getGroupStudents);
router.post('/bulk-mst', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN', 'FACULTY'), require('../controllers/markController').bulkSaveMst);
router.post('/finalize', authorize('FACULTY'), finalizeSubjectMarks);


router.get('/my-marks', authorize('STUDENT'), getMyMarks);

router.patch('/:id/lock', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), lockMarks);

module.exports = router;
