import axios from 'axios';
import { STUDENTS, TEACHERS, SUBJECTS, MOCK_MARKS, FEE_DATA, MOCK_RESULTS } from '../__tests__/mockData';

const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:5001/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

const normalizeResponseShape = (value) => {
    if (Array.isArray(value)) {
        return value.map(normalizeResponseShape);
    }

    if (!value || typeof value !== 'object') {
        return value;
    }

    const normalized = {};

    Object.keys(value).forEach((key) => {
        normalized[key] = normalizeResponseShape(value[key]);
    });

    if (normalized.id && !normalized._id) {
        normalized._id = normalized.id;
    }
    if (normalized.studentId && !normalized.student) {
        normalized.student = normalized.studentId;
    }
    if (normalized.createdBy && !normalized.creator) {
        normalized.creator = normalized.createdBy;
    }

    return normalized;
};

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => {
        if (response?.data) {
            response.data = normalizeResponseShape(response.data);
        }
        return response;
    },
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || '';
        const isLoginRequest = requestUrl.includes('/auth/login');

        if (status === 401 && !isLoginRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Named export for legacy simulated API or specialized methods
export const api = {
    getStudents: async (filters = {}) => {
        const { page = 1, limit = 20, ...rest } = filters;
        // In a real app, you'd pass these to the backend. 
        // For the mock layer, we'll just simulate it.
        await delay(500 + Math.random() * 300);
        let data = [...STUDENTS];
        if (rest.section) data = data.filter(s => s.section === rest.section);
        if (rest.sem) data = data.filter(s => s.sem === parseInt(rest.sem));
        
        const total = data.length;
        const start = (page - 1) * limit;
        const paginatedData = data.slice(start, start + limit);
        
        return {
            success: true,
            data: paginatedData,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    },
    getStudentById: async (id) => {
        await delay(300);
        return STUDENTS.find(s => s.id === parseInt(id));
    },
    getSubjects: async (filters = {}) => {
        const { page = 1, limit = 20, ...rest } = filters;
        await delay(400);
        let data = [...SUBJECTS];
        if (rest.sem) data = data.filter(s => s.sem === parseInt(rest.sem));
        
        const total = data.length;
        const start = (page - 1) * limit;
        const paginatedData = data.slice(start, start + limit);

        return {
            success: true,
            data: paginatedData,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    },
    getResults: async (studentId, sessionId, filters = {}) => {
        const { page = 1, limit = 20 } = filters;
        await delay(400);
        let data = MOCK_RESULTS.filter(r => 
            r.studentId === parseInt(studentId) && 
            (!sessionId || r.sessionId === parseInt(sessionId))
        );

        const total = data.length;
        const start = (page - 1) * limit;
        const paginatedData = data.slice(start, start + limit);

        return {
            success: true,
            data: paginatedData,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    },
    getMarks: async (subjectId, sectionId, sessionId, filters = {}) => {
        const { page = 1, limit = 20 } = filters;
        await delay(400);
        let data = MOCK_MARKS.filter(m => m.subjectId === parseInt(subjectId));

        const total = data.length;
        const start = (page - 1) * limit;
        const paginatedData = data.slice(start, start + limit);

        return {
            success: true,
            data: paginatedData,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    },
    saveMarks: async (subjectId, sectionId, sessionId, marksData) => {
        await delay(800); 
        console.log('API: Marks Saved for Session', sessionId, { subjectId, sectionId, marksData });
        return { success: true, timestamp: new Date().toISOString() };
    },
    getFeeData: async (studentId, sessionId) => {
        await delay(400);
        return FEE_DATA[studentId] || null;
    },
    postPayment: async (payment) => {
        await delay(1000); 
        console.log('API: Payment Posted', payment);
        return { success: true, receiptId: `RCP-${Date.now()}` };
    },
    getDepartmentMetrics: async (deptId, sessionId) => {
        await delay(600);
        return {
            averageAttendance: 76.5,
            passPercentage: 88,
            feeCollection: 1250000,
            session: sessionId
        };
    },
    // New methods for cross-portal consistency
    getProfile: async () => {
        await delay(400);
        // Returns the first student as mock profile
        return STUDENTS[0];
    },
    updateProfile: async (data) => {
        await delay(800);
        console.log('API: Profile Updated', data);
        return { success: true };
    },
    getSections: async () => {
        await delay(400);
        return { success: true, data: { data: [] } }; // Mock empty for now to prevent crash
    },
    getFaculty: async () => {
        await delay(400);
        return { success: true, data: { data: TEACHERS } };
    },
    postAttendance: async (data) => {
        await delay(1000);
        console.log('API: Attendance Posted', data);
        return { success: true };
    }
};

export default axiosInstance;
