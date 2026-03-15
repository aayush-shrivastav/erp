const express = require('express');
const { createNotice, getNotices, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), createNotice)
    .get(getNotices);

router.route('/:id')
    .put(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), updateNotice)
    .delete(authorize('SUPER_ADMIN', 'ACADEMIC_ADMIN'), deleteNotice);

module.exports = router;
