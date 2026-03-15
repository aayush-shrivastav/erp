const { z } = require('zod');

const createFacultySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  phone: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().optional().nullable(),
  departmentId: z.string().uuid('Invalid department ID'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

const updateFacultySchema = createDirectorySchema = createFacultySchema.partial().extend({
    employeeId: z.string().optional(),
});

module.exports = {
  createFacultySchema,
  updateFacultySchema,
};
