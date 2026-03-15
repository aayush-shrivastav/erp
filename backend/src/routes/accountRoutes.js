const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const { createFeeStructure, getFeeStructures } = require('../controllers/accountsController');
const { assignFees, getStudentFees } = require('../controllers/accountsFeeController');
const { addManualFine } = require('../controllers/accountsFineController');
const { processPayment, getPayments, downloadReceipt, reversePayment } = require('../controllers/accountsPaymentController');
const {
    getDashboardMetrics,
    getDefaulters,
    getStudentWiseFeeStatus,
    getSourceWiseCollection,
    getCourseWiseCollection
} = require('../controllers/accountsReportController');
const {
    verifyStudent,
    addCollegeFee,
    addBusFee,
    addFine,
    editPayment,
    getTransactions,
    getEditHistory,
    getLedger
} = require('../controllers/accountsTransactionController');
const { validateRequest } = require('../middlewares/validate');
const { 
  createFeeStructureSchema, 
  processPaymentSchema, 
  addCollegeFeeSchema, 
  addBusFeeSchema, 
  addFineSchema 
} = require('../validators/feeValidator');

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(protect);

// ==========================================
// NEW TRANSACTION API ROUTES (Per Requirements)
// ==========================================

// @desc    Verify student by roll number
// @route   GET /api/accounts/student/:rollNo
// @access  Private/Admin/Accountant
router.get('/student/:rollNo', authorize('ADMIN', 'ACCOUNTANT'), verifyStudent);

// @desc    Add college fee payment
// @route   POST /api/accounts/college-fee
// @access  Private/Admin/Accountant
router.post('/college-fee', authorize('ADMIN', 'ACCOUNTANT'), validateRequest(addCollegeFeeSchema), addCollegeFee);

// @desc    Add bus fee payment
// @route   POST /api/accounts/bus-fee
// @access  Private/Admin/Accountant
router.post('/bus-fee', authorize('ADMIN', 'ACCOUNTANT'), validateRequest(addBusFeeSchema), addBusFee);

// @desc    Add fine
// @route   POST /api/accounts/fine
// @access  Private/Admin/Accountant
router.post('/fine', authorize('ADMIN', 'ACCOUNTANT'), validateRequest(addFineSchema), addFine);

// @desc    Edit a payment entry
// @route   PUT /api/accounts/edit-payment/:id
// @access  Private/Admin/Accountant
router.put('/edit-payment/:id', authorize('ADMIN', 'ACCOUNTANT'), editPayment);

// @desc    Get all transactions for a student
// @route   GET /api/accounts/transactions/:rollNo
// @access  Private/Admin/Accountant
router.get('/transactions/:rollNo', authorize('ADMIN', 'ACCOUNTANT'), getTransactions);

// @desc    Get ledger for a student
// @route   GET /api/accounts/ledger/:rollNo
// @access  Private/Admin/Accountant
router.get('/ledger/:rollNo', authorize('ADMIN', 'ACCOUNTANT'), getLedger);

// @desc    Get edit history for a student
// @route   GET /api/accounts/edit-history/:rollNo
// @access  Private/Admin/Accountant
router.get('/edit-history/:rollNo', authorize('ADMIN', 'ACCOUNTANT'), getEditHistory);

// ==========================================
// EXISTING API ROUTES (Preserved)
// ==========================================

// -- Fee Structure Management -- //
router.route('/structures')
    .post(authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), validateRequest(createFeeStructureSchema), createFeeStructure)
    .get(authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), getFeeStructures);

// -- Assignment -- //
router.post('/assign', authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), assignFees);

// -- Student Specific Views -- //
router.get('/student-fees/:studentId', authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), getStudentFees);
router.post('/student-fees/:id/manual-fine', authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), addManualFine);

// -- Payments & Receipts -- //
router.route('/payments')
    .post(authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), validateRequest(processPaymentSchema), processPayment)
    .get(authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), getPayments);

router.post('/payments/:id/reverse', authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), reversePayment);
router.get('/receipts/:receiptId/download', downloadReceipt);

// -- Reports & Dashboard -- //
router.get('/dashboard', authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), getDashboardMetrics);
router.get('/defaulters', authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), getDefaulters);
router.get('/reports/student-wise', authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), getStudentWiseFeeStatus);
router.get('/reports/source-wise', authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), getSourceWiseCollection);
router.get('/reports/course-wise', authorize('SUPER_ADMIN', 'ACCOUNTS_ADMIN'), getCourseWiseCollection);

module.exports = router;
