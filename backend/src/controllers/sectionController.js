const prisma = require('../config/prisma');

exports.createSection = async (req, res, next) => {
    try {
        const section = await prisma.section.create({ data: req.body });
        res.status(201).json({ success: true, data: section });
    } catch (error) { next(error); }
};

exports.getSections = async (req, res, next) => {
    try {
        const where = {};
        if (req.query.semester) where.semesterId = req.query.semester;
        if (req.query.course) where.courseId = req.query.course;

        const sections = await prisma.section.findMany({
            where,
            include: {
                semester: { select: { name: true } },
                course: { select: { name: true } },
                classTeacher: { select: { name: true, employeeId: true } }
            }
        });
        res.status(200).json({ success: true, count: sections.length, data: sections });
    } catch (error) { next(error); }
};

exports.assignClassTeacher = async (req, res, next) => {
    try {
        const section = await prisma.section.update({
            where: { id: req.params.id },
            data: { classTeacherId: req.body.facultyId }
        });
        res.status(200).json({ success: true, data: section });
    } catch (error) { next(error); }
};

exports.updateSection = async (req, res, next) => {
    try {
        const section = await prisma.section.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.status(200).json({ success: true, data: section });
    } catch (error) { next(error); }
};

exports.deleteSection = async (req, res, next) => {
    try {
        await prisma.section.delete({
            where: { id: req.params.id }
        });
        res.status(200).json({ success: true, data: {} });
    } catch (error) { next(error); }
};
