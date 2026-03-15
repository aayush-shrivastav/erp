const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Server Error';

    // Log error for debugging (in production, use proper logging service)
    if (process.env.NODE_ENV === 'development') {
        console.error('Error Details:', {
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    }

    // Prisma specific errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (err.code === 'P2002') {
            message = `Duplicate field value entered`;
            if (err.meta && err.meta.target) {
                message += `: ${err.meta.target}`;
            }
            statusCode = 400;
        }
        // Record not found
        if (err.code === 'P2025') {
            message = 'Resource not found';
            statusCode = 404;
        }
    }

    // Prisma validation error
    if (err instanceof Prisma.PrismaClientValidationError) {
        message = 'Invalid data input for database operation';
        statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        message = 'Token expired';
        statusCode = 401;
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { errorHandler };
