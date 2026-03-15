const prisma = require('../config/prisma');

exports.getAttendance = async (req, res, next) => {
    try {
        const { skip, take, page, limit } = req.pagination || { skip: 0, take: 20, page: 1, limit: 20 };

        const [attendance, total] = await Promise.all([
            prisma.attendance.findMany({
                include: {
                    session: { select: { year: true } },
                    section: { select: { name: true } },
                    subject: { select: { name: true, code: true } },
                    faculty: { select: { name: true, employeeId: true } },
                    records: {
                        include: {
                            student: { 
                                select: { 
                                    name: true, 
                                    enrollmentNo: true,
                                    user: { select: { email: true } }
                                } 
                            }
                        }
                    }
                },
                orderBy: { date: 'desc' },
                skip,
                take
            }),
            prisma.attendance.count()
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({ 
            success: true, 
            data: attendance,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) { next(error); }
};

exports.takeAttendance = async (req, res, next) => {
    try {
        const { session, date, section, subject, faculty, records } = req.body;

        if (!date || !section || !subject || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ success: false, message: 'Date, section, subject and attendance records are required' });
        }

        let sessionId = session;
        if (!sessionId) {
            const activeSession = await prisma.academicSession.findFirst({
                where: { isActive: true },
                select: { id: true }
            });
            if (!activeSession) {
                return res.status(400).json({ success: false, message: 'No active academic session found' });
            }
            sessionId = activeSession.id;
        }

        let facultyId = faculty;
        if (!facultyId) {
            const facultyProfile = await prisma.faculty.findFirst({
                where: { userId: req.user.id },
                select: { id: true }
            });
            if (!facultyProfile) {
                return res.status(400).json({ success: false, message: 'Faculty profile not found for current user' });
            }
            facultyId = facultyProfile.id;
        }

        const dateObj = new Date(date);

        // Check if attendance already exists for this date and class
        let attendance = await prisma.attendance.findFirst({
            where: {
                sessionId,
                date: dateObj,
                sectionId: section,
                subjectId: subject
            },
            include: { records: true }
        });

        if (attendance) {
            if (attendance.isLocked) {
                return res.status(400).json({ success: false, message: 'Attendance for this date is already locked' });
            }
            
            // Delete old records and create new ones
            await prisma.attendanceRecord.deleteMany({
                where: { attendanceId: attendance.id }
            });
            
            await prisma.attendanceRecord.createMany({
                data: records.map(r => ({
                    attendanceId: attendance.id,
                    studentId: r.student,
                    status: r.status
                }))
            });

            if (facultyId && facultyId !== attendance.facultyId) {
                await prisma.attendance.update({
                    where: { id: attendance.id },
                    data: { facultyId }
                });
            }
        } else {
            attendance = await prisma.attendance.create({
                data: {
                    sessionId,
                    date: dateObj,
                    sectionId: section,
                    subjectId: subject,
                    facultyId,
                    records: {
                        create: records.map(r => ({
                            studentId: r.student,
                            status: r.status
                        }))
                    }
                }
            });
        }

        res.status(200).json({ success: true, data: attendance });
    } catch (error) { next(error); }
};

exports.updateAttendanceSettings = async (req, res, next) => {
    try {
        const { session, date, section, subject, isLocked } = req.body;
        const dateObj = new Date(date);

        const attendance = await prisma.attendance.findFirst({
            where: {
                sessionId: session,
                date: dateObj,
                sectionId: section,
                subjectId: subject
            }
        });

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance record not found for this date/class' });
        }

        const updated = await prisma.attendance.update({
            where: { id: attendance.id },
            data: { isLocked }
        });

        res.status(200).json({ success: true, data: updated });
    } catch (error) { next(error); }
};

exports.getOverallAttendanceReports = async (req, res, next) => {
    try {
        const { session, section } = req.query;
        let where = {};
        if (session) where.sessionId = session;
        if (section) where.sectionId = section;

        const attendances = await prisma.attendance.findMany({
            where,
            include: {
                subject: { select: { name: true, code: true } },
                faculty: { select: { name: true } }
            }
        });

        res.status(200).json({ success: true, count: attendances.length, data: attendances });
    } catch (error) { next(error); }
};

exports.getMyAttendance = async (req, res, next) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        const attendances = await prisma.attendance.findMany({
            where: {
                records: {
                    some: { studentId: student.id }
                }
            },
            include: {
                subject: { select: { name: true, code: true } },
                faculty: { select: { name: true } },
                records: {
                    where: { studentId: student.id }
                }
            }
        });

        res.status(200).json({ success: true, count: attendances.length, data: attendances });
    } catch (error) { next(error); }
};
