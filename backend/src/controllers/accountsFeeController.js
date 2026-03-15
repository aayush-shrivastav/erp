const prisma = require('../config/prisma');

exports.assignFees = async (req, res, next) => {
    try {
        const { course, semester, feeStructureId } = req.body;

        const feeStructure = await prisma.feeStructure.findUnique({
            where: { id: feeStructureId }
        });
        if (!feeStructure || !feeStructure.isActive) {
            return res.status(404).json({ success: false, message: 'Active fee structure not found' });
        }

        const students = await prisma.student.findMany({
            where: { courseId: course, currentSemesterId: semester, isPassout: false }
        });

        let assignedCount = 0;
        const assignmentErrors = [];

        for (const student of students) {
            try {
                const existing = await prisma.studentFee.findFirst({
                    where: { studentId: student.id, feeStructureId: feeStructure.id }
                });
                if (!existing) {
                    await prisma.studentFee.create({
                        data: {
                            studentId: student.id,
                            feeStructureId: feeStructure.id,
                            totalAmount: feeStructure.totalAmount,
                            totalPayable: feeStructure.totalAmount,
                            remainingBalance: feeStructure.totalAmount
                        }
                    });
                    assignedCount++;
                }
            } catch (err) {
                assignmentErrors.push(`Failed to assign for student ${student.enrollmentNo}: ${err.message}`);
            }
        }

        res.status(200).json({
            success: true,
            message: `Successfully assigned fees to ${assignedCount} students.`,
            errors: assignmentErrors.length > 0 ? assignmentErrors : undefined
        });
    } catch (error) { next(error); }
};

exports.getStudentFees = async (req, res, next) => {
    try {
        const fees = await prisma.studentFee.findMany({
            where: { studentId: req.params.studentId },
            include: {
                feeStructure: true,
                manualFines: {
                    select: { amount: true, reason: true, description: true, dateAdded: true, addedById: true }
                } // Prisma doesn't easily populate a nested related user from a JSON array if it's unstructured, or if using a related model it does.
                  // Assume manualFines was stored natively. Wait, manualFines is stored as JSON in Prisma according to schema.
            }
        });

        for (let fee of fees) {
            await updateAutoFine(fee);
        }

        const updatedFees = await prisma.studentFee.findMany({
            where: { studentId: req.params.studentId },
            include: { feeStructure: true }
        });

        res.status(200).json({ success: true, count: updatedFees.length, data: updatedFees });
    } catch (err) { next(err); }
};

const updateAutoFine = async (studentFeeDoc) => {
    if (studentFeeDoc.status === 'PAID') return;

    if (!studentFeeDoc.feeStructure || !studentFeeDoc.feeStructure.dueDate) return;

    const structure = studentFeeDoc.feeStructure;
    const now = new Date();
    const dueDate = new Date(structure.dueDate);

    if (now > dueDate && structure.finePerDay > 0) {
        const diffTime = Math.abs(now - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let rawAutoFine = diffDays * structure.finePerDay;

        if (structure.maxFineLimit > 0 && rawAutoFine > structure.maxFineLimit) {
            rawAutoFine = structure.maxFineLimit;
        }

        if (rawAutoFine !== studentFeeDoc.autoFineAmount) {
            const newTotalFine = rawAutoFine + studentFeeDoc.totalManualFineAmount;
            const newTotalPayable = studentFeeDoc.totalAmount + newTotalFine;
            
            await prisma.studentFee.update({
                where: { id: studentFeeDoc.id },
                data: {
                    autoFineAmount: rawAutoFine,
                    totalFineAmount: newTotalFine,
                    totalPayable: newTotalPayable,
                    remainingBalance: newTotalPayable - studentFeeDoc.paidAmount
                }
            });
        }
    }
};
