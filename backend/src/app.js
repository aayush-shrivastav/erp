require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        // but only if not in production or if specifically desired.
        // For a web app, we typically want to be strict.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// 3. Rate Limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply general limiter to all /api routes
app.use('/api', generalLimiter);

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/receipts', express.static(path.join(__dirname, '..', 'public', 'receipts')));

// Recursive mapping to alias 'id' as '_id' for frontend MongoDB compatibility
const mapIdToUnderscoreId = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(mapIdToUnderscoreId);
    } else if (obj !== null && typeof obj === 'object') {
        if (obj instanceof Date) return obj;
        const newObj = {};
        for (const [key, value] of Object.entries(obj)) {
            if (key === 'id') {
                newObj['_id'] = value;
                newObj['id'] = value;
            } else {
                newObj[key] = mapIdToUnderscoreId(value);
            }
        }
        return newObj;
    }
    return obj;
};

// Global Response Interceptor
app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        if (data) data = mapIdToUnderscoreId(data);
        return originalJson.call(this, data);
    };
    next();
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const academicRoutes = require('./routes/academicRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const subjectAssignmentRoutes = require('./routes/subjectAssignmentRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const feeRoutes = require('./routes/feeRoutes');
const markRoutes = require('./routes/markRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const settingRoutes = require('./routes/settingRoutes');
const accountRoutes = require('./routes/accountRoutes');
const groupRoutes = require('./routes/groupRoutes');
const labGroupRoutes = require('./routes/labGroupRoutes');

// Mount Routes
// Apply login-specific rate limit before mounting auth routes
app.use('/api/v1/auth/login', loginLimiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admins', adminRoutes);
app.use('/api/v1/academic', academicRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/sections', sectionRoutes);
app.use('/api/v1/subject-assignments', subjectAssignmentRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/faculty', facultyRoutes);
app.use('/api/v1/timetables', timetableRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/marks', markRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/labgroups', labGroupRoutes);

// Base Route
app.get('/', (req, res) => {
    res.status(200).json({ 
        success: true,
        message: 'Welcome to the College ERP API',
        version: '1.0.0'
    });
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// 5. Global Error Handler Middleware
const { errorHandler } = require('./middlewares/error');
app.use(errorHandler);

module.exports = app;

