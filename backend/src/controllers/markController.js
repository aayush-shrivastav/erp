const prisma = require('../config/prisma');
const marksService = require('../services/marksService');

exports.createOrUpdateMarks = async (req, res, next) => {
    try {
        const { examType, mstNumber, session, subject, section, faculty, records, maxMarks } = req.body;

        const parsedMaxMarks = Number(maxMarks);

        if (!examType || !subject || !section || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ success: false, message: 'Exam type, subject, section and mark records are required' });
        }
        if (!Number.isFinite(parsedMaxMarks) || parsedMaxMarks <= 0) {
            return res.status(400).json({ success: false, message: 'Max marks must be greater than 0' });
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

        let markEntry = await prisma.mark.findFirst({
            where: { examType, mstNumber: mstNumber ? Number(mstNumber) : null, sessionId, subjectId: subject, sectionId: section }
        });

        if (markEntry && markEntry.isLocked) {
            return res.status(400).json({ message: 'Marks for this exam are already locked' });
        }

        if (markEntry) {
            // Delete old records and create new
            await prisma.markRecord.deleteMany({
                where: { markId: markEntry.id }
            });
            await prisma.markRecord.createMany({
                data: records.map(r => ({
                    markId: markEntry.id,
                    studentId: r.student,
                    marksObtained: r.marksObtained
                }))
            });

            markEntry = await prisma.mark.update({
                where: { id: markEntry.id },
                data: { facultyId, maxMarks: parsedMaxMarks }
            });
        } else {
            markEntry = await prisma.mark.create({
                data: {
                    examType,
                    mstNumber: mstNumber ? Number(mstNumber) : null,
                    sessionId,
                    subjectId: subject,
                    sectionId: section,
                    facultyId,
                    maxMarks: parsedMaxMarks,
                    records: {
                        create: records.map(r => ({
                            studentId: r.student,
                            marksObtained: r.marksObtained
                        }))
                    }
                }
            });
        }

        res.status(200).json({ success: true, data: markEntry });
    } catch (error) { next(error); }
};

exports.getMarks = async (req, res, next) => {
    try {
        const where = { ...req.query };
        // Translate IDs manually if passed as query params directly
        if(where.subject) { where.subjectId = where.subject; delete where.subject; }
        if(where.section) { where.sectionId = where.section; delete where.section; }
        if(where.session) { where.sessionId = where.session; delete where.session; }
        
        // Remove pagination params from where clause
        delete where.page;
        delete where.limit;

        const { skip, take, page, limit } = req.pagination || { skip: 0, take: 20, page: 1, limit: 20 };

        const [marks, total] = await Promise.all([
            prisma.mark.findMany({
                where,
                include: {
                    subject: { select: { name: true, code: true } },
                    section: { select: { name: true } },
                    session: { select: { year: true } },
                    records: true
                },
                skip,
                take
            }),
            prisma.mark.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({ 
            success: true, 
            data: marks,
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

exports.lockMarks = async (req, res, next) => {
    try {
        const markEntry = await prisma.mark.update({
            where: { id: req.params.id },
            data: { isLocked: true }
        });
        res.status(200).json({ success: true, data: markEntry });
    } catch (error) { next(error); }
};

exports.getMyMarks = async (req, res, next) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        const marks = await prisma.mark.findMany({
            where: {
                isLocked: true,
                records: {
                    some: { studentId: student.id }
                }
            },
            include: {
                subject: { select: { id: true, name: true, code: true } },
                session: { select: { year: true } },
                section: true,
                records: {
                    where: { studentId: student.id }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            },
        });

        res.status(200).json({ success: true, count: marks.length, data: marks });
    } catch (error) { next(error); }
};

exports.getTeacherClasses = async (req, res, next) => {
    try {
        const faculty = await prisma.faculty.findFirst({ where: { userId: req.user.id } });
        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty profile not found' });
        }

        const classes = await prisma.subjectAssignment.findMany({
            where: { facultyId: faculty.id },
            include: {
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        type: true
                    }
                },
                section: {
                    select: {
                        id: true,
                        name: true,
                        students: {
                            select: { id: true, name: true, enrollmentNo: true }
                        }
                    }
                }
            }
        });

        const formattedClasses = classes.map(c => ({
            id: c.id,
            subject: c.subject,
            group: c.section.name,
            type: c.subject.type === 'THEORY' ? 'Theory' : 'Lab',
            studentCount: c.section.students.length,
            students: c.section.students
        }));

        res.status(200).json({ success: true, data: formattedClasses });
    } catch (error) { next(error); }
};

exports.getGroupStudents = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const students = await prisma.section.findUnique({
            where: { id: groupId },
            include: {
                students: {
                    include: {
                        user: { select: { email: true } }
                    }
                }
            }
        });

        if (!students) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        res.status(200).json({ success: true, data: students.students });
    } catch (error) { next(error); }
};

exports.finalizeSubjectMarks = async (req, res, next) => {
    try {
        const { subjectId, sectionId, sessionId } = req.body;
        const faculty = await prisma.faculty.findFirst({ where: { userId: req.user.id } });

        // Get MST1,2,3 records
        const mstMarks = await prisma.mark.findMany({
            where: {
                subjectId,
                sectionId,
                sessionId,
                mstNumber: { in: [1,2,3] }
            },
            include: { records: true }
        });

        // Compute for each student
        const students = [...new Set(mstMarks.flatMap(m => m.records.map(r => r.studentId)))];
        const updates = students.map(studentId => {
            const studentMsts = mstMarks.map(m => m.records.find(r => r.studentId === studentId)?.marksObtained || 0);
            const finalMst = marksService.computeFinalMst(...studentMsts);
            return {
                studentId,
                finalMst
            };
        });

        // Create/update final Mark
        let finalMark = await prisma.mark.findFirst({
            where: { subjectId, sectionId, sessionId, isFinalized: true }
        });

        if (finalMark) {
            // Update records
            await prisma.markRecord.deleteMany({ where: { markId: finalMark.id } });
            await prisma.markRecord.createMany({
                data: updates.map(u => ({
                    markId: finalMark.id,
                    studentId: u.studentId,
                    marksObtained: u.finalMst || 0
                }))
            });
        } else {
            finalMark = await prisma.mark.create({
                data: {
                    examType: 'FINAL',
                    sessionId,
                    subjectId,
                    sectionId,
                    facultyId: faculty.id,
                    maxMarks: 50, // Configurable
                    isFinalized: true,
                    records: {
                        create: updates.map(u => ({
                            studentId: u.studentId,
                            marksObtained: u.finalMst || 0
                        }))
                    }
                }
            });
        }

        res.status(200).json({ success: true, data: finalMark });
    } catch (error) { next(error); }
};

exports.bulkSaveMst = async (req, res, next) => {
    try {
        const { session, subject, section, maxMarks, faculty, mstData } = req.body; // mstData: { mst1: records, mst2: records, mst3: records }
        const facultyId = faculty || (await prisma.faculty.findFirst({ where: { userId: req.user.id } })).id;

        const savePromises = [];
        if (mstData.mst1) {
            savePromises.push(exports.createOrUpdateMarks({
                body: { examType: 'MID_SEM', mstNumber: 1, session, subject, section, faculty: facultyId, records: mstData.mst1, maxMarks },
                user: req.user
            }, { status: () => ({ json: () => {} }) }, next));
        }
        if (mstData.mst2) {
            savePromises.push(exports.createOrUpdateMarks({
                body: { examType: 'MID_SEM', mstNumber: 2, session, subject, section, faculty: facultyId, records: mstData.mst2, maxMarks },
                user: req.user
            }, { status: () => ({ json: () => {} }) }, next));
        }
        if (mstData.mst3) {
            savePromises.push(exports.createOrUpdateMarks({
                body: { examType: 'MID_SEM', mstNumber: 3, session, subject, section, faculty: facultyId, records: mstData.mst3, maxMarks },
                user: req.user
            }, { status: () => ({ json: () => {} }) }, next));
        }

        await Promise.all(savePromises);
        res.status(200).json({ success: true, message: 'All MSTs saved successfully' });
    } catch (error) { next(error); }
};
