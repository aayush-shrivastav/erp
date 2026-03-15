const prisma = require('../config/prisma');

exports.createLabGroup = async (req, res, next) => {
    try {
        const { name, parentSectionId, capacity } = req.body;
        
        const labGroup = await prisma.labGroup.create({
            data: {
                name,
                parentSectionId,
                capacity: capacity || 30
            },
            include: {
                parentSection: {
                    select: { name: true },
                    include: {
                        department: { select: { name: true, code: true } },
                        semester: { select: { name: true, level: true } }
                    }
                },
                students: { select: { id: true } }
            }
        });
        
        res.status(201).json({ success: true, data: labGroup });
    } catch (error) { next(error); }
};

exports.getLabGroups = async (req, res, next) => {
    try {
        const labGroups = await prisma.labGroup.findMany({
            include: {
                parentSection: {
                    select: { name: true },
                    include: {
                        department: { select: { name: true, code: true } },
                        semester: { select: { name: true, level: true } }
                    }
                },
                students: { select: { id: true } }
            }
        });
        
        const transformedLabGroups = labGroups.map(labGroup => ({
            id: labGroup.id,
            name: labGroup.name,
            parentSection: labGroup.parentSection,
            capacity: labGroup.capacity,
            studentCount: labGroup.students.length
        }));
        
        res.status(200).json({ success: true, count: transformedLabGroups.length, data: transformedLabGroups });
    } catch (error) { next(error); }
};

exports.updateLabGroup = async (req, res, next) => {
    try {
        const { name, capacity } = req.body;
        
        const labGroup = await prisma.labGroup.update({
            where: { id: req.params.id },
            data: { name, capacity },
            include: {
                parentSection: {
                    select: { name: true },
                    include: {
                        department: { select: { name: true, code: true } },
                        semester: { select: { name: true, level: true } }
                    }
                }
            }
        });
        
        res.status(200).json({ success: true, data: labGroup });
    } catch (error) { next(error); }
};

exports.deleteLabGroup = async (req, res, next) => {
    try {
        await prisma.labGroup.delete({
            where: { id: req.params.id }
        });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Lab Group not found' });
        }
        next(error);
    }
};

exports.getLabGroupStudents = async (req, res, next) => {
    try {
        const students = await prisma.student.findMany({
            where: { labGroupId: req.params.id },
            include: {
                user: { select: { name: true, email: true } },
                section: { select: { name: true } }
            }
        });
        
        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (error) { next(error); }
};

exports.assignStudentsToLabGroup = async (req, res, next) => {
    try {
        const { studentIds } = req.body;
        
        // Update students to assign them to the lab group
        const updatedStudents = await prisma.student.updateMany({
            where: { id: { in: studentIds } },
            data: { labGroupId: req.params.id }
        });
        
        res.status(200).json({ 
            success: true, 
            data: { updatedCount: updatedStudents.count } 
        });
    } catch (error) { next(error); }
};
