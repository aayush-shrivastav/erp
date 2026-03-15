const express = require('express');
const { createSection, getSections, assignClassTeacher, updateSection, deleteSection } = require('../controllers/sectionController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), createSection)
    .get(getSections);

router.route('/:id')
    .put(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), updateSection)
    .delete(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), deleteSection);

router.route('/:id/assign-teacher')
    .post(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), assignClassTeacher);

module.exports = router;
