export const ACADEMIC_SESSIONS = [
  { id: 1, name: "2024–2025", startDate: "2024-07-10", endDate: "2025-05-30", status: "ACTIVE" },
  { id: 2, name: "2023–2024", startDate: "2023-07-10", endDate: "2024-05-30", status: "ARCHIVED" }
];

export const STUDENTS = [
  { 
    id: 1,  
    enrollment: "BT2024001", 
    name: "Rahul Kumar",   
    course: "B.Tech CSE", 
    sem: 3, 
    section: "3C1", 
    funding: "DRCC",        
    status: "ACTIVE",
    profileStatus: "VERIFIED",
    isAlreadyPromotedInSession: false
  },
  { 
    id: 2,  
    enrollment: "BT2024002", 
    name: "Priya Sharma",  
    course: "B.Tech CSE", 
    sem: 3, 
    section: "3C1", 
    funding: "SCHOLARSHIP", 
    status: "ACTIVE",
    profileStatus: "PENDING",
    isAlreadyPromotedInSession: true
  },
  { 
    id: 3,  
    enrollment: "BT2024003", 
    name: "Amit Verma",    
    course: "B.Tech CSE", 
    sem: 3, 
    section: "3C1", 
    funding: "SELF",        
    status: "ACTIVE",
    profileStatus: "INCOMPLETE"
  },
  { id: 4, enrollment: "BT2024004", name: "Sneha Singh", course: "B.Tech CSE", sem: 3, section: "3C2", funding: "DRCC", status: "ACTIVE", profileStatus: "VERIFIED" },
  { id: 5, enrollment: "BT2024005", name: "Rohit Gupta", course: "B.Tech CSE", sem: 3, section: "3C2", funding: "SELF", status: "ACTIVE", profileStatus: "VERIFIED" },
  { id: 6, enrollment: "BT2024006", name: "Anjali Mehta", course: "B.Tech CSE", sem: 4, section: "4C1", funding: "SCHOLARSHIP", status: "ACTIVE", profileStatus: "VERIFIED" },
  { id: 7, enrollment: "BT2024007", name: "Vikram Yadav", course: "B.Tech CSE", sem: 4, section: "4C1", funding: "SELF", status: "ACTIVE", profileStatus: "VERIFIED" },
  { id: 8, enrollment: "BT2024008", name: "Neha Patel", course: "B.Tech CSE", sem: 4, section: "4C2", funding: "DRCC", status: "ACTIVE", profileStatus: "VERIFIED" }
];

export const TEACHERS = [
  { id: 1, empId: "EMP001", name: "Rajesh Kumar", dept: "CSE", role: "HOD", subjects: ["Data Structures", "Operating Systems"] },
  { id: 2, empId: "EMP002", name: "Amit Sharma", dept: "CSE", role: "Teacher", subjects: ["DS Lab", "Networks"] },
  { id: 3, empId: "EMP003", name: "Priya Mehta", dept: "CSE", role: "Mentor", subjects: ["DBMS", "Python"] },
  { id: 4, empId: "EMP004", name: "Suresh Gupta", dept: "CSE", role: "Teacher", subjects: ["Maths", "Physics"] }
];

export const SUBJECTS = [
  { id: 1, code: "CS301", name: "Data Structures", sem: 3, credits: 4, type: "Theory", prerequisite: "CS101" },
  { id: 2, code: "CS302", name: "Operating Systems", sem: 3, credits: 4, type: "Theory", prerequisite: "CS102" },
  { id: 3, code: "CS303", name: "Database Management", sem: 3, credits: 3, type: "Theory" },
  { id: 4, code: "CS304", name: "Computer Networks", sem: 3, credits: 3, type: "Theory" },
  { id: 5, code: "CS305", name: "DS Lab", sem: 3, credits: 2, type: "Lab", prerequisite: "CS101" }
];

// Marks State Management (Part A2)
// subjectId_sectionId_sessionId
export const MARKS_STATUS = {
    "1_3C1_1": { status: "DRAFT", lastSaved: "2024-03-14T10:00:00Z" },
    "2_3C1_1": { status: "SUBMITTED", submittedAt: "2024-03-12T14:30:00Z", date: "12 Mar 2024" },
    "3_3C1_1": { status: "LOCKED", lockedAt: "2024-03-10T09:00:00Z", date: "10 Mar 2024" }
};

export const MOCK_MARKS = [
  { studentId: 1, subjectId: 1, mst1: 18, mst2: 20, mst3: 16, assignment: 8, attendance: 5 },
  { studentId: 2, subjectId: 1, mst1: 22, mst2: 24, mst3: 12, assignment: 9, attendance: 4 },
  { studentId: 3, subjectId: 1, mst1: 15, mst2: 12, mst3: 10, assignment: 6, attendance: 3 }
];

export const FEE_DATA = {
  1: { 
    totalFee: 80000, 
    received: 45000, 
    pending: 35000, 
    govtPortion: 60000, 
    govtReceived: 35000,
    studentPortion: 20000, 
    studentPaid: 10000,
    drccExpectedDate: "2024-03-01", // Should be overdue
    status: "DRCC_PENDING",
    history: [
      { date: '2024-01-15', amount: 35000, source: 'DRCC', txn: 'DRCC-9921', status: 'VERIFIED' },
      { date: '2024-02-10', amount: 10000, source: 'SELF', txn: 'UPI-4401', status: 'VERIFIED' },
    ]
  },
  2: { 
    totalFee: 80000, 
    received: 80000, 
    pending: 0, 
    govtPortion: 30000, 
    govtReceived: 30000,
    studentPortion: 50000, 
    studentPaid: 50000,
    status: "PAID",
    history: [
       { date: '2024-01-05', amount: 30000, source: 'SCHOLARSHIP', txn: 'SCH-881', status: 'VERIFIED' },
       { date: '2024-01-20', amount: 50000, source: 'SELF', txn: 'UPI-992', status: 'VERIFIED' },
    ]
  },
  3: { 
    totalFee: 80000, 
    received: 40000, 
    pending: 40000, 
    govtPortion: 0, 
    govtReceived: 0,
    studentPortion: 80000, 
    studentPaid: 40000,
    status: "PARTIAL",
    history: [
      { date: '2024-02-15', amount: 40000, source: 'SELF', txn: 'CASH-101', status: 'VERIFIED' }
    ]
  }
};

export const DEPARTMENTS = [
  { id: 1, name: "Computer Science & Engineering", code: "CSE" },
  { id: 2, name: "Electronics & Communication", code: "ECE" }
];

export const COURSES = [
  { id: 1, name: "B.Tech Computer Science", code: "B.TECH_CSE", deptId: 1 },
  { id: 2, name: "B.Tech Electronics", code: "B.TECH_ECE", deptId: 2 }
];

export const NOTIFICATIONS = [
    { id: 1, type: 'ADMIN', message: 'Profile approval pending: 3 students', link: '/admin/students?tab=pending', read: false, time: '2h ago' },
    { id: 2, type: 'TEACHER', message: 'Marks deadline in 3 days: Data Structures', link: '/teacher/marks', read: false, time: '5h ago' },
    { id: 3, type: 'STUDENT', message: 'Internal marks published: Data Structures', link: '/student/internal-marks', read: true, time: '1d ago' }
];

export const MOCK_RESULTS = [
    { 
        id: 1, 
        studentId: 1, 
        sessionId: 2, 
        semester: 2, 
        subjects: [
            { subjectCode: "CS201", name: "Programming in C", grade: "F", internal: 12, external: 15, total: 27 },
            { subjectCode: "CS202", name: "Discrete Math", grade: "B", internal: 18, external: 45, total: 63 }
        ]
    },
    { 
        id: 2, 
        studentId: 1, 
        sessionId: 1, 
        semester: 3, 
        subjects: [
            { subjectCode: "CS201", name: "Programming in C", grade: "A", internal: 22, external: 55, total: 77 },
        ]
    }
];

// Result Status State Machine (Part 1.1)
// mockData.resultStatus[sessionId][semesterId][sectionId]
export const RESULT_STATUS = {
    "1": { // Session 1
        "3": { // Semester 3
            "3C1": { status: "RESULTS_COMPILED", updatedAt: "2024-03-14T12:00:00Z" }
        }
    }
};

export const MOCK_MENTOR_ASSIGNMENTS = [
  { id: 1, teacherId: 3, sessionId: 1, studentIds: [1, 2, 3] }
];

export const COLLEGE_INFO = {
    name: "Antigravity Institute of Technology",
    city: "New Delhi",
    state: "Delhi",
    university: "State Technical University",
    principal: "Dr. Arvind Swami"
};

// Phase 3 Hardening: Centralized Receipt Counter
export let receiptCounter = { value: 1001 };
