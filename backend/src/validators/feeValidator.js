const { z } = require('zod');

const createFeeStructureSchema = z.object({
  course: z.string().uuid('Invalid course ID'),
  semester: z.string().uuid('Invalid semester ID'),
  tuitionFee: z.number().min(0).optional().default(0),
  labFee: z.number().min(0).optional().default(0),
  libraryFee: z.number().min(0).optional().default(0),
  otherCharges: z.number().min(0).optional().default(0),
  dueDate: z.string().min(1, 'Due date is required'),
  finePerDay: z.number().min(0).optional().default(0),
  maxFineLimit: z.number().min(0).optional().default(0),
});

const processPaymentSchema = z.object({
  studentFeeId: z.string().uuid('Invalid student fee ID'),
  amountPaid: z.number().gt(0, 'Amount paid must be greater than 0'),
  paymentMode: z.enum(['CASH', 'ONLINE', 'CHECK', 'TRANSFER']),
  transactionId: z.string().optional(),
  paymentDate: z.string().optional(),
  paymentSource: z.enum(['SELF', 'DRCC', 'SCHOLARSHIP']).optional(),
});

const addCollegeFeeSchema = z.object({
  rollNo: z.string().min(1, 'Roll number is required'),
  semester: z.string().optional(),
  amount: z.number().gt(0, 'Amount must be greater than 0'),
  paymentSource: z.enum(['SELF', 'DRCC', 'SCHOLARSHIP']),
  paymentMode: z.string().min(1, 'Payment mode is required'),
  transactionId: z.string().optional(),
  paymentDate: z.string().optional(),
});

const addBusFeeSchema = z.object({
  rollNo: z.string().min(1, 'Roll number is required'),
  amount: z.number().gt(0, 'Amount must be greater than 0'),
  paymentSource: z.enum(['SELF', 'DRCC', 'SCHOLARSHIP']),
  paymentMode: z.string().min(1, 'Payment mode is required'),
  transactionId: z.string().optional(),
  paymentDate: z.string().optional(),
  busRoute: z.string().optional(),
});

const addFineSchema = z.object({
  rollNo: z.string().min(1, 'Roll number is required'),
  amount: z.number().gt(0, 'Amount must be greater than 0'),
  paymentSource: z.enum(['SELF', 'DRCC', 'SCHOLARSHIP']),
  paymentMode: z.string().min(1, 'Payment mode is required'),
  transactionId: z.string().optional(),
  paymentDate: z.string().optional(),
  fineReason: z.string().optional(),
  fineDescription: z.string().optional(),
});

module.exports = {
  createFeeStructureSchema,
  processPaymentSchema,
  addCollegeFeeSchema,
  addBusFeeSchema,
  addFineSchema,
};
