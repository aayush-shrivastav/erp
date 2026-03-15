const express = require('express');
const {
    createLabGroup, getLabGroups, updateLabGroup, deleteLabGroup, 
    getLabGroupStudents, assignStudentsToLabGroup
} = require('../controllers/labGroupController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'));

router.route('/')
    .post(createLabGroup)
    .get(getLabGroups);

router.route('/:id')
    .put(updateLabGroup)
    .delete(deleteLabGroup);

router.route('/:id/students')
    .get(getLabGroupStudents)
    .put(assignStudentsToLabGroup);

module.exports = router;
