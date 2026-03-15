const express = require('express');
const { createSubject, getSubjects, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), createSubject)
    .get(getSubjects);

router.route('/:id')
    .put(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), updateSubject)
    .delete(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), deleteSubject);

module.exports = router;
