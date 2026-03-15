const prisma = require('../config/prisma');

exports.createFeeStructure = async (req, res, next) => {
    try {
        const { course, semester, tuitionFee, labFee, libraryFee, otherCharges, dueDate, finePerDay, maxFineLimit } = req.body;

        if (!course || !semester || !dueDate) {
            return res.status(400).json({ success: false, message: 'Course, semester and due date are required' });
        }

        const parsedTuitionFee = Number(tuitionFee) || 0;
        const parsedLabFee = Number(labFee) || 0;
        const parsedLibraryFee = Number(libraryFee) || 0;
        const parsedOtherCharges = Number(otherCharges) || 0;
        const parsedFinePerDay = Number(finePerDay) || 0;
        const parsedMaxFineLimit = Number(maxFineLimit) || 0;
        const totalAmount = parsedTuitionFee + parsedLabFee + parsedLibraryFee + parsedOtherCharges;

        const existing = await prisma.feeStructure.findFirst({
            where: { courseId: course, semesterId: semester }
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Fee structure already exists for this course and semester' });
        }

        const structure = await prisma.feeStructure.create({
            data: {
                courseId: course,
                semesterId: semester,
                tuitionFee: parsedTuitionFee,
                labFee: parsedLabFee,
                libraryFee: parsedLibraryFee,
                otherCharges: parsedOtherCharges,
                totalAmount,
                dueDate: new Date(dueDate),
                finePerDay: parsedFinePerDay,
                maxFineLimit: parsedMaxFineLimit
            }
        });

        res.status(201).json({ success: true, data: structure });
    } catch (error) {
        next(error);
    }
};

exports.getFeeStructures = async (req, res, next) => {
    try {
        const structures = await prisma.feeStructure.findMany({
            include: {
                course: { select: { name: true } },
                semester: { select: { name: true, level: true } }
            }
        });

        res.status(200).json({ success: true, count: structures.length, data: structures });
    } catch (error) {
        next(error);
    }
};
