const prisma = require('../config/prisma');

exports.createFeeStructure = async (req, res, next) => {
    try {
        const { course, semester, dueDate, ...rest } = req.body;
        const fee = await prisma.feeStructure.create({
            data: {
                courseId: course,
                semesterId: semester,
                dueDate: new Date(dueDate),
                ...rest
            }
        });
        res.status(201).json({ success: true, data: fee });
    } catch (error) { next(error); }
};

exports.getFees = async (req, res, next) => {
    try {
        const where = { ...req.query };
        Object.keys(where).forEach(key => {
            if (where[key] === '') delete where[key];
        });

        const fees = await prisma.studentFee.findMany({
            where,
            include: {
                student: { select: { name: true, enrollmentNo: true } },
                feeStructure: true
            }
        });
        res.status(200).json({ success: true, count: fees.length, data: fees });
    } catch (error) { next(error); }
};

exports.addPayment = async (req, res, next) => {
    try {
        // Find existing fee
        const fee = await prisma.fee.findUnique({ where: { id: req.params.id } });
        if (!fee) return res.status(404).json({ message: 'Fee record not found' });

        let paymentsArr = fee.payments;
        if (typeof paymentsArr === 'string') paymentsArr = JSON.parse(paymentsArr);
        if (!Array.isArray(paymentsArr)) paymentsArr = [];
        
        paymentsArr.push(req.body);
        const newPaidAmount = fee.paidAmount + req.body.amount;
        
        let newStatus = fee.status;
        if (newPaidAmount >= fee.totalAmount) {
            newStatus = 'PAID';
        } else if (newPaidAmount > 0) {
            newStatus = 'PARTIAL';
        }

        const updatedFee = await prisma.fee.update({
            where: { id: req.params.id },
            data: {
                payments: paymentsArr,
                paidAmount: newPaidAmount,
                status: newStatus
            }
        });
        
        res.status(200).json({ success: true, data: updatedFee });
    } catch (error) { next(error); }
};

exports.getMyFees = async (req, res, next) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        const fees = await prisma.studentFee.findMany({
            where: { studentId: student.id },
            include: { feeStructure: true }
        });

        let needRefetch = false;
        for (let fee of fees) {
            if (fee.status !== 'PAID' && fee.feeStructure && fee.feeStructure.dueDate) {
                const now = new Date();
                const dueDate = new Date(fee.feeStructure.dueDate);
                if (now > dueDate && fee.feeStructure.finePerDay > 0) {
                    const diffDays = Math.ceil(Math.abs(now - dueDate) / (1000 * 60 * 60 * 24));
                    let rawAutoFine = diffDays * fee.feeStructure.finePerDay;
                    if (fee.feeStructure.maxFineLimit > 0 && rawAutoFine > fee.feeStructure.maxFineLimit) {
                        rawAutoFine = fee.feeStructure.maxFineLimit;
                    }
                    if (rawAutoFine !== fee.autoFineAmount) {
                        const newTotalFineAmount = rawAutoFine + fee.totalManualFineAmount;
                        const newTotalPayable = fee.totalAmount + newTotalFineAmount;
                        
                        await prisma.studentFee.update({
                            where: { id: fee.id },
                            data: {
                                autoFineAmount: rawAutoFine,
                                totalFineAmount: newTotalFineAmount,
                                totalPayable: newTotalPayable,
                                remainingBalance: newTotalPayable - fee.paidAmount
                            }
                        });
                        needRefetch = true;
                    }
                }
            }
        }

        const finalFees = needRefetch
            ? await prisma.studentFee.findMany({ where: { studentId: student.id }, include: { feeStructure: true } })
            : fees;

        res.status(200).json({ success: true, count: finalFees.length, data: finalFees });
    } catch (error) { next(error); }
};
