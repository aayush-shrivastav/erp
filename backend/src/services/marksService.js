const prisma = require('../config/prisma');

/**
 * Marks Management Service
 * Calculation logic for MST and final marks
 */

const marksService = {
  computeFinalMst: (mst1, mst2, mst3) => {
    const scores = [mst1, mst2, mst3].filter(s => s !== null && s !== undefined).sort((a, b) => b - a);
    return scores.length >= 2 ? (scores[0] + scores[1]) : (scores[0] || 0);
  },

  computeAttendancePercentage: async (studentId, subjectId, sectionId, sessionId = null) => {
    const where = { 
      studentId,
      attendance: {
        subjectId,
        sectionId,
        ...(sessionId && { sessionId })
      }
    };
    
    const total = await prisma.attendanceRecord.count({ where });
    const present = await prisma.attendanceRecord.count({ 
      where: { 
        ...where, 
        status: 'PRESENT' 
      } 
    });
    
    return total > 0 ? (present / total) * 100 : 0;
  },

  computeAttendanceMarks: async (studentId, subjectId, sectionId, sessionId, maxAttendanceMarks = 10) => {
    const percentage = await marksService.computeAttendancePercentage(studentId, subjectId, sectionId, sessionId);
    return (percentage / 100) * maxAttendanceMarks;
  },

  getSubjectFinalMarks: async (studentId, subjectId, sessionId) => {
    const mstMarks = await prisma.mark.findMany({
      where: {
        subjectId,
        sessionId,
        mstNumber: { in: [1,2,3] },
        records: { some: { studentId } }
      },
      include: { records: { where: { studentId } } }
    });

    const mst1 = mstMarks.find(m => m.mstNumber === 1)?.records[0]?.marksObtained || 0;
    const mst2 = mstMarks.find(m => m.mstNumber === 2)?.records[0]?.marksObtained || 0;
    const mst3 = mstMarks.find(m => m.mstNumber === 3)?.records[0]?.marksObtained || 0;

    const finalMst = marksService.computeFinalMst(mst1, mst2, mst3);

    // Find assignment/attendance marks (same subject, different examType)
    const assignmentMark = await prisma.mark.findFirst({
      where: { subjectId, sessionId, examType: 'ASSIGNMENT', records: { some: { studentId } } },
      include: { records: { where: { studentId } } }
    });

    const attendanceMark = await prisma.mark.findFirst({
      where: { subjectId, sessionId, examType: 'ATTENDANCE', records: { some: { studentId } } },
      include: { records: { where: { studentId } } }
    });

    const assignment = assignmentMark?.records[0]?.marksObtained || 0;
    const attendance = attendanceMark?.records[0]?.marksObtained || 0;

    const finalMarks = finalMst + assignment + attendance;

    return {
      mst1, mst2, mst3, finalMst, assignment, attendance, finalMarks
    };
  }
};

module.exports = marksService;

