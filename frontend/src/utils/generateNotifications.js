/**
 * Dynamic Notification Engine
 * Derives actionable alerts based on current system state.
 */
export const generateNotifications = (user, data) => {
    const notifications = [];
    const today = new Date();

    if (!user) return [];

    // 1. Role-based: STUDENT
    if (user.role === 'student') {
        const studentData = data.students?.find(s => s.id === user.id);
        const feeData = data.fees?.[user.id];
        const results = data.results?.filter(r => r.studentId === user.id);

        // Attendance Alert
        if (studentData?.attendancePct < 75) {
            notifications.push({
                id: `attn-${Date.now()}`,
                type: 'CRITICAL',
                title: 'Low Attendance Warning',
                message: `Your attendance is ${studentData.attendancePct}%, which is below the 75% threshold.`,
                actionUrl: '/student/attendance'
            });
        }

        // Fee Due Alert
        if (feeData?.pending > 0) {
            notifications.push({
                id: `fee-${Date.now()}`,
                type: 'WARNING',
                title: 'Pending Fee Dues',
                message: `You have an outstanding balance of ₹${feeData.pending.toLocaleString()}.`,
                actionUrl: '/student/fees'
            });
        }

        // Result Published
        if (results?.some(r => r.newlyPublished)) {
            notifications.push({
                id: `res-${Date.now()}`,
                type: 'SUCCESS',
                title: 'Results Published',
                message: 'Internal examination results for the current session are now available.',
                actionUrl: '/student/dashboard'
            });
        }
    }

    // 2. Role-based: TEACHER
    if (user.role === 'teacher' || user.role === 'mentor') {
        // Marks Entry Deadline
        notifications.push({
            id: `marks-${Date.now()}`,
            type: 'INFO',
            title: 'Marks Entry Deadline',
            message: 'MST-1 internal marks entry for Section 3C1 closes in 48 hours.',
            actionUrl: '/teacher/marks'
        });

        // Mentor Task
        if (user.role === 'mentor') {
            notifications.push({
                id: `mentor-${Date.now()}`,
                type: 'WARNING',
                title: 'Mentor Review Required',
                message: '3 students in your group have critical attendance alerts.',
                actionUrl: '/teacher/mentor'
            });
        }
    }

    // 3. Global: System/Calendar
    if (data.calendar?.events) {
        const upcomingExam = data.calendar.events.find(e => e.type === 'EXAM' && new Date(e.date) > today);
        if (upcomingExam) {
            notifications.push({
                id: `sys-${Date.now()}`,
                type: 'INFO',
                title: 'Upcoming Examination',
                message: `${upcomingExam.title} is scheduled for ${upcomingExam.date}.`,
                actionUrl: '/calendar'
            });
        }
    }

    return notifications;
};
