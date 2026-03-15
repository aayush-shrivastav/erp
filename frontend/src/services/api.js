import axios from 'axios';

const api = axios.create({
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

    // Backward compatibility for legacy frontend code expecting Mongo-style keys.
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

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiry or unauthorized errors
api.interceptors.response.use(
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

export default api;
