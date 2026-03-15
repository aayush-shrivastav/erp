const express = require('express');
const {
    createGroup, getGroups, updateGroup, deleteGroup, getGroupStudents
} = require('../controllers/groupController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'));

router.route('/')
    .post(createGroup)
    .get(getGroups);

router.route('/:id')
    .put(updateGroup)
    .delete(deleteGroup);

router.route('/:id/students')
    .get(getGroupStudents);

module.exports = router;
