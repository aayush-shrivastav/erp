const facultyService = require('../services/facultyService');
const prisma = require('../config/prisma');

exports.createFaculty = async (req, res, next) => {
    try {
        const faculty = await facultyService.createFaculty(req.body);
        res.status(201).json({ success: true, data: faculty });
    } catch (error) { next(error); }
};

exports.getFaculty = async (req, res, next) => {
    try {
        const pagination = req.pagination || { skip: 0, take: 20, page: 1, limit: 20 };
        const { faculty, total } = await facultyService.getAllFaculty(pagination);

        const totalPages = Math.ceil(total / pagination.limit);

        res.status(200).json({ 
            success: true, 
            data: faculty,
            pagination: {
                total,
                page: pagination.page,
                limit: pagination.limit,
                totalPages,
                hasNext: pagination.page < totalPages,
                hasPrev: pagination.page > 1
            }
        });
    } catch (error) { next(error); }
};

exports.updateFaculty = async (req, res, next) => {
    try {
        const faculty = await facultyService.updateFaculty(req.params.id, req.body);
        res.status(200).json({ success: true, data: faculty });
    } catch (error) { next(error); }
};

exports.deleteFaculty = async (req, res, next) => {
    try {
        await facultyService.deleteFaculty(req.params.id);
        res.status(200).json({ success: true, message: 'Faculty deleted successfully' });
    } catch (error) { next(error); }
};

exports.assignSubjects = async (req, res, next) => {
    try {
        const faculty = await facultyService.assignSubjects(req.params.id, req.body.subjectIds);
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

// These specialized reports/assignment queries can stay or move eventually
exports.getMyAssignments = async (req, res, next) => {
    try {
        const faculty = await prisma.faculty.findFirst({ where: { userId: req.user.id } });
        const assignments = await prisma.subjectAssignment.findMany({
            where: { facultyId: faculty.id },
            include: { subject: true, section: true }
        });
        res.status(200).json({ success: true, data: assignments });
    } catch (error) { next(error); }
};

exports.getMyTimetable = async (req, res, next) => {
    try {
        const faculty = await prisma.faculty.findFirst({ where: { userId: req.user.id } });
        const timetable = await prisma.timetable.findMany({
            where: { facultyId: faculty.id },
            include: { subject: true, section: true }
        });
        res.status(200).json({ success: true, data: timetable });
    } catch (error) { next(error); }
};
