const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

exports.createDirectory = async (req, res, next) => {
    // keeping place for existing controller naming mapping
}

exports.createFaculty = async (req, res, next) => {
    try {
        const { email, employeeId, name, phone, designation, joiningDate, departmentId, password } = req.body;

        // Check if user already exists
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Check if employee ID already exists
        const employeeExists = await prisma.faculty.findUnique({ where: { employeeId } });
        if (employeeExists) return res.status(400).json({ message: 'Employee ID already exists' });

        const hashedPassword = await bcrypt.hash(password || employeeId, 10);

        const user = await prisma.user.create({
            data: { email, password: hashedPassword, role: 'FACULTY' }
        });

        const faculty = await prisma.faculty.create({
            data: {
                userId: user.id,
                employeeId,
                name,
                phone,
                designation,
                joiningDate: joiningDate ? new Date(joiningDate) : null,
                departmentId
            }
        });

        res.status(201).json({ success: true, data: faculty });
    } catch (error) { next(error); }
};

exports.getFaculty = async (req, res, next) => {
    try {
        const faculty = await prisma.faculty.findMany({
            include: {
                user: { select: { email: true } },
                department: { select: { name: true, code: true } },
                facultySubjects: { 
                    include: { 
                        subject: { select: { name: true, code: true, type: true } } 
                    } 
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, count: faculty.length, data: faculty });
    } catch (error) { next(error); }
};

exports.assignSubjects = async (req, res, next) => {
    try {
        // Create Many-to-Many relations in Prisma
        const subjects = req.body.subjectIds.map(id => ({
            facultyId: req.params.id,
            subjectId: id
        }));
        
        // Use nested create or createMany on the join table
        await prisma.facultySubject.createMany({
            data: subjects,
            skipDuplicates: true
        });

        const faculty = await prisma.faculty.findUnique({
            where: { id: req.params.id },
            include: { facultySubjects: { include: { subject: true } } }
        });
        
        res.status(200).json({ success: true, data: faculty });
    } catch (error) { next(error); }
};

exports.getMe = async (req, res, next) => {
    try {
        const faculty = await prisma.faculty.findFirst({
            where: { userId: req.user.id },
            include: {
                department: { select: { name: true, code: true } },
                facultySubjects: { include: { subject: { select: { name: true, code: true, type: true } } } }
            }
        });

        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty profile not found' });
        }

        res.status(200).json({ success: true, data: faculty });
    } catch (error) { next(error); }
};

exports.getMyAssignments = async (req, res, next) => {
    try {
        const faculty = await prisma.faculty.findFirst({ where: { userId: req.user.id } });
        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty profile not found' });
        }

        const assignments = await prisma.subjectAssignment.findMany({
            where: { facultyId: faculty.id },
            include: {
                subject: { select: { id: true, name: true, code: true, credits: true, type: true } },
                section: { 
                    select: {
                        id: true,
                        name: true,
                        semester: {
                            select: {
                                id: true,
                                name: true,
                                session: { select: { id: true, year: true } }
                            }
                        }
                    }
                }
            }
        });

        res.status(200).json({ success: true, count: assignments.length, data: assignments });
    } catch (error) { next(error); }
};

exports.getMyTimetable = async (req, res, next) => {
    try {
        const faculty = await prisma.faculty.findFirst({ where: { userId: req.user.id } });
        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty profile not found' });
        }

        const where = { facultyId: faculty.id };
        if (req.query.dayOfWeek) {
            where.dayOfWeek = req.query.dayOfWeek;
        }

        const timetable = await prisma.timetable.findMany({
            where,
            include: {
                subject: { select: { name: true, code: true } },
                section: { select: { name: true } }
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });

        res.status(200).json({ success: true, count: timetable.length, data: timetable });
    } catch (error) { next(error); }
};

exports.updateFaculty = async (req, res, next) => {
    try {
        const { name, email, phone, designation, joiningDate, departmentId, employeeId } = req.body;
        
        // Check if employee ID already exists (if being updated)
        if (employeeId) {
            const existingFaculty = await prisma.faculty.findFirst({ 
                where: { 
                    employeeId,
                    id: { not: req.params.id }
                } 
            });
            if (existingFaculty) {
                return res.status(400).json({ message: 'Employee ID already exists' });
            }
        }
        
        const faculty = await prisma.faculty.update({
            where: { id: req.params.id },
            data: { 
                name, 
                phone,
                designation,
                joiningDate: joiningDate ? new Date(joiningDate) : null,
                departmentId,
                ...(employeeId && { employeeId })
            }
        });

        if (email) {
            const updateData = {};
            updateData.email = email;
            
            await prisma.user.update({
                where: { id: faculty.userId },
                data: updateData
            });
        }

        res.status(200).json({ success: true, data: faculty, message: 'Faculty updated successfully' });
    } catch (error) { next(error); }
};

exports.deleteFaculty = async (req, res, next) => {
    try {
        const faculty = await prisma.faculty.findUnique({ where: { id: req.params.id } });
        if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

        await prisma.faculty.delete({ where: { id: faculty.id } });
        await prisma.user.delete({ where: { id: faculty.userId } });

        res.status(200).json({ success: true, message: 'Faculty deleted successfully' });
    } catch (error) { next(error); }
};
