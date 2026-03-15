const prisma = require('../config/prisma');

exports.addManualFine = async (req, res, next) => {
    try {
        const { amount, reason, description } = req.body;

        const fee = await prisma.studentFee.findUnique({
            where: { id: req.params.id }
        });
        if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });

        if (fee.status === 'PAID') {
            return res.status(400).json({ success: false, message: 'Cannot add fine to fully paid fee structure.' });
        }

        let manualFinesArr = fee.manualFines;
        if (typeof manualFinesArr === 'string') manualFinesArr = JSON.parse(manualFinesArr);
        if (!Array.isArray(manualFinesArr)) manualFinesArr = [];

        manualFinesArr.push({
            amount,
            reason,
            description,
            addedBy: req.user.id,
            addedAt: new Date()
        });

        const newTotalManualFineAmount = fee.totalManualFineAmount + amount;
        const newTotalFineAmount = fee.autoFineAmount + newTotalManualFineAmount;
        const newTotalPayable = fee.totalAmount + newTotalFineAmount;
        const newRemainingBalance = newTotalPayable - fee.paidAmount;

        const updatedFee = await prisma.studentFee.update({
            where: { id: req.params.id },
            data: {
                manualFines: manualFinesArr,
                totalManualFineAmount: newTotalManualFineAmount,
                totalFineAmount: newTotalFineAmount,
                totalPayable: newTotalPayable,
                remainingBalance: newRemainingBalance
            }
        });

        res.status(200).json({ success: true, data: updatedFee });
    } catch (error) { next(error); }
};
