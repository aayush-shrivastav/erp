const prisma = require('../config/prisma');

exports.createGroup = async (req, res, next) => {
    try {
        const { name, semesterId, departmentId, section } = req.body;
        
        // Create section as group
        const group = await prisma.section.create({
            data: {
                name,
                departmentId,
                semesterId,
                capacity: 60 // Default capacity
            },
            include: {
                department: { select: { name: true, code: true } },
                semester: { select: { name: true, level: true } }
            }
        });
        
        res.status(201).json({ success: true, data: group });
    } catch (error) { next(error); }
};

exports.getGroups = async (req, res, next) => {
    try {
        const groups = await prisma.section.findMany({
            include: {
                department: { select: { name: true, code: true } },
                semester: { select: { name: true, level: true } },
                students: { select: { id: true } },
                labGroups: {
                    select: { id: true, name, capacity }
                }
            }
        });
        
        // Transform data to show group information
        const transformedGroups = groups.map(group => ({
            id: group.id,
            name: group.name,
            semester: group.semester,
            department: group.department,
            studentCount: group.students.length,
            labGroupCount: group.labGroups.length,
            labGroups: group.labGroups
        }));
        
        res.status(200).json({ success: true, count: transformedGroups.length, data: transformedGroups });
    } catch (error) { next(error); }
};

exports.updateGroup = async (req, res, next) => {
    try {
        const { name, capacity } = req.body;
        
        const group = await prisma.section.update({
            where: { id: req.params.id },
            data: { name, capacity },
            include: {
                department: { select: { name: true, code: true } },
                semester: { select: { name: true, level: true } }
            }
        });
        
        res.status(200).json({ success: true, data: group });
    } catch (error) { next(error); }
};

exports.deleteGroup = async (req, res, next) => {
    try {
        await prisma.section.delete({
            where: { id: req.params.id }
        });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }
        next(error);
    }
};

exports.getGroupStudents = async (req, res, next) => {
    try {
        const students = await prisma.student.findMany({
            where: { sectionId: req.params.id },
            include: {
                user: { select: { name: true, email: true } },
                labGroup: { select: { name: true } }
            }
        });
        
        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (error) { next(error); }
};
