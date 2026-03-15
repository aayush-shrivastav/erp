const prisma = require('../config/prisma');

exports.createAssignment = async (req, res, next) => {
    try {
        const { faculty, subject, section } = req.body;
        const assignment = await prisma.subjectAssignment.create({
            data: {
                facultyId: faculty,
                subjectId: subject,
                sectionId: section
            }
        });
        res.status(201).json({ success: true, data: assignment });
    } catch (error) { next(error); }
};

exports.getAssignments = async (req, res, next) => {
    try {
        const assignments = await prisma.subjectAssignment.findMany({
            where: req.query,
            include: {
                faculty: { select: { name: true, employeeId: true } },
                subject: { select: { name: true, code: true } },
                section: {
                    include: {
                        course: { select: { name: true } },
                        semester: { select: { name: true, level: true } },
                        department: { select: { code: true } }
                    }
                }
            }
        });
        res.status(200).json({ success: true, count: assignments.length, data: assignments });
    } catch (error) { next(error); }
};

exports.deleteAssignment = async (req, res, next) => {
    try {
        await prisma.subjectAssignment.delete({
            where: { id: req.params.id }
        });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        next(error);
    }
};
