const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { createAssignment, getAssignments, deleteAssignment } = require('../controllers/subjectAssignmentController');

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'));

router.route('/')
    .post(createAssignment)
    .get(getAssignments);

router.route('/:id')
    .delete(deleteAssignment);

module.exports = router;
