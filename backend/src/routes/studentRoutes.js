const express = require('express');
const {
    createStudent, bulkImportStudents, getStudents, promoteStudent, markPassout, getMe, deleteStudent, updateStudent
} = require('../controllers/studentController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), createStudent)
    .get(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN', 'FACULTY', 'ACCOUNTS_ADMIN'), getStudents);

router.get('/me', authorize('STUDENT'), getMe);

router.post('/bulk', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), bulkImportStudents);
router.put('/:id/promote', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), promoteStudent);
router.patch('/:id/passout', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), markPassout);
router.put('/:id', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), updateStudent);
router.delete('/:id', authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), deleteStudent);

module.exports = router;
