import { STUDENTS, TEACHERS, SUBJECTS, MOCK_MARKS, FEE_DATA, MOCK_RESULTS } from '../data/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Simulated API layer to reveal loading states and handle async operations.
 * Session-Aware (Part 2.1)
 */
export const api = {
    // --- Students ---
    getStudents: async (filters = {}) => {
        await delay(500 + Math.random() * 300);
        let data = [...STUDENTS];
        if (filters.section) data = data.filter(s => s.section === filters.section);
        if (filters.sem) data = data.filter(s => s.sem === parseInt(filters.sem));
        return data;
    },

    getStudentById: async (id) => {
        await delay(300);
        return STUDENTS.find(s => s.id === parseInt(id));
    },

    // --- Academic ---
    getSubjects: async (filters = {}) => {
        await delay(400);
        let data = [...SUBJECTS];
        if (filters.sem) data = data.filter(s => s.sem === parseInt(filters.sem));
        return data;
    },

    // --- Results & Backlogs ---
    getResults: async (studentId, sessionId) => {
        await delay(400);
        return MOCK_RESULTS.filter(r => 
            r.studentId === parseInt(studentId) && 
            (!sessionId || r.sessionId === parseInt(sessionId))
        );
    },

    // --- Marks ---
    getMarks: async (subjectId, sectionId, sessionId) => {
        await delay(400);
        // In real app, we'd filter MOCK_MARKS by criteria including sessionId
        return MOCK_MARKS.filter(m => m.subjectId === parseInt(subjectId));
    },

    saveMarks: async (subjectId, sectionId, sessionId, marksData) => {
        await delay(800); 
        console.log('API: Marks Saved for Session', sessionId, { subjectId, sectionId, marksData });
        return { success: true, timestamp: new Date().toISOString() };
    },

    // --- Finance ---
    getFeeData: async (studentId, sessionId) => {
        await delay(400);
        // Extension: could filter fee data by session
        return FEE_DATA[studentId] || null;
    },

    postPayment: async (payment) => {
        await delay(1000); 
        console.log('API: Payment Posted', payment);
        return { success: true, receiptId: `RCP-${Date.now()}` };
    },

    // --- Analytics ---
    getDepartmentMetrics: async (deptId, sessionId) => {
        await delay(600);
        return {
            averageAttendance: 76.5,
            passPercentage: 88,
            feeCollection: 1250000,
            session: sessionId
        };
    }
};
