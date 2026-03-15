const prisma = require('../config/prisma');

exports.createSubject = async (req, res, next) => {
    try {
        const subject = await prisma.subject.create({ data: req.body });
        res.status(201).json({ success: true, data: subject });
    } catch (error) { next(error); }
};

exports.getSubjects = async (req, res, next) => {
    try {
        const where = {};
        if (req.query.department) where.departmentId = req.query.department;
        if (req.query.semester) where.semesterId = req.query.semester;

        const subjects = await prisma.subject.findMany({
            where,
            include: {
                department: { select: { name: true, code: true } },
                semester: { select: { name: true } }
            }
        });
        res.status(200).json({ success: true, count: subjects.length, data: subjects });
    } catch (error) { next(error); }
};

exports.updateSubject = async (req, res, next) => {
    try {
        const subject = await prisma.subject.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.status(200).json({ success: true, data: subject, message: 'Subject updated successfully' });
    } catch (error) { next(error); }
};

exports.deleteSubject = async (req, res, next) => {
    try {
        await prisma.subject.delete({
            where: { id: req.params.id }
        });
        res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) { next(error); }
};
