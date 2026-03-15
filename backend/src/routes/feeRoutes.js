const express = require('express');
const { createFeeStructure, getFees, addPayment, getMyFees } = require('../controllers/feeController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/my-fees', authorize('STUDENT'), getMyFees);

router.route('/')
    .post(authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), createFeeStructure)
    .get(authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), getFees);

router.post('/:id/payments', authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), addPayment);

module.exports = router;
