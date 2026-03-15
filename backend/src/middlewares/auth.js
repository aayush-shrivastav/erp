const jwt = require('jsonwebtoken');

const getEffectiveRoles = (role) => {
    switch (role) {
    case 'SUPER_ADMIN':
        return ['SUPER_ADMIN', 'ACADEMIC_ADMIN', 'ACCOUNTS_ADMIN', 'ADMIN', 'ACCOUNTANT'];
    case 'ADMIN':
        // Legacy ADMIN users should retain access across both admin domains.
        return ['ADMIN', 'ACADEMIC_ADMIN', 'ACCOUNTS_ADMIN'];
    case 'ACCOUNTS_ADMIN':
        return ['ACCOUNTS_ADMIN', 'ACCOUNTANT'];
    default:
        return [role];
    }
};

const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route - No token provided'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = {
                id: decoded.id,
                role: decoded.role
            };
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized - Invalid or expired token'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized - User not authenticated'
            });
        }

        const effectiveRoles = getEffectiveRoles(req.user.role);
        const isAuthorized = roles.some((role) => effectiveRoles.includes(role));

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}`
            });
        }
        next();
    };
};

// Higher-order function to catch async errors
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = { protect, authorize, catchAsync };

