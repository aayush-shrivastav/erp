const prisma = require('../config/prisma');

exports.getTimetables = async (req, res, next) => {
    try {
        const timetables = await prisma.timetable.findMany({
            include: {
                section: { select: { name: true } },
                subject: { select: { name: true, code: true } },
                faculty: { select: { name: true, employeeId: true } }
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });
        res.status(200).json({ success: true, count: timetables.length, data: timetables });
    } catch (error) { next(error); }
};

exports.createTimeSlot = async (req, res, next) => {
    try {
        const { section, dayOfWeek, startTime, endTime, subject, faculty, roomNo, batch = 'ALL' } = req.body;

        const facultyClash = await prisma.timetable.findFirst({
            where: {
                facultyId: faculty,
                dayOfWeek,
                OR: [
                    { startTime: { lt: endTime, gte: startTime } },
                    { endTime: { gt: startTime, lte: endTime } }
                ]
            }
        });

        if (facultyClash) {
            return res.status(400).json({ message: 'Faculty is already assigned to another class during this time.' });
        }

        const roomClash = await prisma.timetable.findFirst({
            where: {
                roomNo,
                dayOfWeek,
                OR: [
                    { startTime: { lt: endTime, gte: startTime } },
                    { endTime: { gt: startTime, lte: endTime } }
                ]
            }
        });

        if (roomClash) {
            return res.status(400).json({ message: 'Room is already occupied during this time.' });
        }

        const slot = await prisma.timetable.create({
            data: {
                sectionId: section,
                dayOfWeek,
                startTime,
                endTime,
                subjectId: subject,
                facultyId: faculty,
                roomNo,
                batch
            }
        });
        res.status(201).json({ success: true, data: slot });
    } catch (error) { next(error); }
};

exports.getSectionTimetable = async (req, res, next) => {
    try {
        const slots = await prisma.timetable.findMany({
            where: { sectionId: req.params.sectionId },
            include: {
                subject: { select: { name: true, code: true } },
                faculty: { select: { name: true } }
            }
        });
        res.status(200).json({ success: true, count: slots.length, data: slots });
    } catch (error) { next(error); }
};

exports.updateTimeSlot = async (req, res, next) => {
    try {
        const { section, dayOfWeek, startTime, endTime, subject, faculty, roomNo, batch = 'ALL' } = req.body;
        
        // Ensure no clashes with OTHER sessions
        const facultyClash = await prisma.timetable.findFirst({
            where: {
                facultyId: faculty,
                dayOfWeek,
                id: { not: req.params.id },
                OR: [
                    { startTime: { lt: endTime, gte: startTime } },
                    { endTime: { gt: startTime, lte: endTime } }
                ]
            }
        });

        if (facultyClash) {
            return res.status(400).json({ message: 'Faculty is already assigned to another class during this time.' });
        }

        const roomClash = await prisma.timetable.findFirst({
            where: {
                roomNo,
                dayOfWeek,
                id: { not: req.params.id },
                OR: [
                    { startTime: { lt: endTime, gte: startTime } },
                    { endTime: { gt: startTime, lte: endTime } }
                ]
            }
        });

        if (roomClash) {
            return res.status(400).json({ message: 'Room is already occupied during this time.' });
        }

        const slot = await prisma.timetable.update({
            where: { id: req.params.id },
            data: {
                sectionId: section,
                dayOfWeek,
                startTime,
                endTime,
                subjectId: subject,
                facultyId: faculty,
                roomNo,
                batch
            }
        });
        res.status(200).json({ success: true, data: slot });
    } catch (error) { next(error); }
};

exports.deleteTimeSlot = async (req, res, next) => {
    try {
        await prisma.timetable.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, message: 'Time slot deleted successfully' });
    } catch (error) { next(error); }
};
