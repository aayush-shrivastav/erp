const { z } = require('zod');

const createStudentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  enrollmentNo: z.string().min(1, 'Enrollment number is required'),
  universityRollNo: z.string().optional().nullable(),
  phone: z.string().optional(),
  admissionDate: z.string().optional().nullable(),
  departmentId: z.string().uuid('Invalid department ID'),
  courseId: z.string().uuid('Invalid course ID'),
  currentSemesterId: z.string().uuid('Invalid semester ID'),
  sectionId: z.string().uuid('Invalid section ID'),
  fundingType: z.enum(['SELF', 'DRCC', 'SCHOLARSHIP']).default('SELF'),
});

const updateStudentSchema = createStudentSchema.partial().extend({
    // Allow universityRollNo to be null or empty string which becomes null in controller
    universityRollNo: z.string().optional().nullable(),
});

module.exports = {
  createStudentSchema,
  updateStudentSchema,
};
