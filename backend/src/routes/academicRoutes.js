const express = require('express');
const {
    createDepartment, getDepartments, assignHOD, updateDepartment, deleteDepartment,
    createCourse, getCourses, updateCourse, deleteCourse,
    createSession, getSessions, activateSession, updateSession, deleteSession,
    createSemester, getSemesters, updateSemester, deleteSemester
} = require('../controllers/academicController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

// Only Super Admin and Academic Admin can manage academic structure
router.use(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'));

router.route('/departments').post(createDepartment).get(getDepartments);
router.route('/departments/:id').put(updateDepartment).delete(deleteDepartment);
router.route('/departments/:id/assign-hod').put(assignHOD);
router.route('/courses').post(createCourse).get(getCourses);
router.route('/courses/:id').put(updateCourse).delete(deleteCourse);
router.route('/sessions').post(createSession).get(getSessions);
router.route('/sessions/:id').put(updateSession).delete(deleteSession);
router.route('/sessions/:id/activate').put(activateSession);
router.route('/semesters').post(createSemester).get(getSemesters);
router.route('/semesters/:id').put(updateSemester).delete(deleteSemester);

module.exports = router;
