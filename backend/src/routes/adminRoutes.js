const express = require('express');
const { createAdmin, getAdmins, updateAdmin, deleteAdmin } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('SUPER_ADMIN')); // Only Super Admin can manage other admins

router.route('/')
    .post(createAdmin)
    .get(getAdmins);

router.route('/:id')
    .put(updateAdmin)
    .delete(deleteAdmin);

module.exports = router;
