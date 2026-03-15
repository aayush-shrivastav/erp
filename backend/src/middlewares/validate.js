/**
 * Middleware to validate request data based on a Zod schema.
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against.
 * @returns {Function} - Express middleware function.
 */
const validateRequest = (schema) => (req, res, next) => {
    try {
        const validatedData = schema.parse(req.body);
        // Replace request body with validated data (strips unknown fields if schema uses .strict() or matches exactly)
        req.body = validatedData;
        next();
    } catch (error) {
        if (error.name === 'ZodError') {
            const errors = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
        }
        next(error);
    }
};

module.exports = { validateRequest };
