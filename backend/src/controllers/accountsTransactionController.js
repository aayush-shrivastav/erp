const prisma = require('../config/prisma');
const { v4: uuidv4 } = require('uuid');

exports.getLedger = async (req, res, next) => {
    try {
        const { rollNo } = req.params;
        if (!rollNo) return res.status(400).json({ success: false, message: 'Roll number is required' });

        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { enrollmentNo: rollNo },
                    { universityRollNo: rollNo }
                ]
            }
        });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found with the given roll number' });
        }

        const ledger = await prisma.studentLedger.findUnique({ where: { studentId: student.id } });

        res.status(200).json({
            success: true,
            data: ledger || {
                totalFee: 0, paidAmount: 0, pendingAmount: 0,
                collegeFee: { total: 0, paid: 0, pending: 0 },
                busFee: { total: 0, paid: 0, pending: 0, route: '' },
                fine: { total: 0, paid: 0, pending: 0 },
                paymentsBySource: { SELF: 0, DRCC: 0, SCHOLARSHIP: 0 }
            }
        });
    } catch (error) { 
        next(error); 
    }
};

exports.verifyStudent = async (req, res, next) => {
    try {
        const { rollNo } = req.params;
        if (!rollNo) return res.status(400).json({ success: false, message: 'Roll number is required' });

        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { enrollmentNo: rollNo },
                    { universityRollNo: rollNo }
                ]
            },
            include: {
                department: { select: { name: true, code: true } },
                course: { select: { name: true, code: true } },
                currentSemester: { select: { name: true, level: true } }
            }
        });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found with the given roll number' });
        }

        const ledger = await prisma.studentLedger.findUnique({ where: { studentId: student.id } });

        res.status(200).json({
            success: true,
            data: {
                student: {
                    id: student.id,
                    name: student.name,
                    enrollmentNo: student.enrollmentNo,
                    universityRollNo: student.universityRollNo,
                    department: student.department,
                    course: student.course,
                    currentSemester: student.currentSemester,
                    fundingType: student.fundingType
                },
                ledger: ledger || {
                    totalFee: 0, paidAmount: 0, pendingAmount: 0,
                    collegeFee: { total: 0, paid: 0, pending: 0 },
                    busFee: { total: 0, paid: 0, pending: 0, route: '' },
                    fine: { total: 0, paid: 0, pending: 0 },
                    paymentsBySource: { SELF: 0, DRCC: 0, SCHOLARSHIP: 0 }
                }
            }
        });
    } catch (error) { next(error); }
};

exports.addCollegeFee = async (req, res, next) => {
    try {
        const { rollNo, semester, amount, paymentSource, paymentMode, transactionId, paymentDate } = req.body;

        if (!rollNo || !amount || !paymentSource || !paymentMode) {
            return res.status(400).json({ success: false, message: 'Please provide rollNo, amount, paymentSource, and paymentMode' });
        }
        if (amount <= 0) return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });

        const student = await prisma.student.findFirst({
            where: { OR: [{ enrollmentNo: rollNo }, { universityRollNo: rollNo }] }
        });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const txnId = transactionId || `TXN-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;
        const existingTxn = await prisma.transaction.findUnique({ where: { transactionId: txnId } });
        if (existingTxn) return res.status(400).json({ success: false, message: 'Transaction ID already exists' });

        const transaction = await prisma.transaction.create({
            data: {
                studentId: student.id,
                feeType: 'COLLEGE_FEE',
                semester,
                amount,
                paymentMode,
                transactionId: txnId,
                paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                createdById: req.user.id,
                paymentSource: paymentSource || student.fundingType
            }
        });

        await updateLedger(student.id, 'COLLEGE_FEE', amount, paymentSource);

        res.status(201).json({ success: true, message: 'College fee payment added successfully', data: transaction });
    } catch (error) { next(error); }
};

exports.addBusFee = async (req, res, next) => {
    try {
        const { rollNo, amount, paymentSource, paymentMode, transactionId, paymentDate, busRoute } = req.body;

        if (!rollNo || !amount || !paymentSource || !paymentMode) {
            return res.status(400).json({ success: false, message: 'Please provide rollNo, amount, paymentSource, paymentMode' });
        }
        if (amount <= 0) return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });

        const student = await prisma.student.findFirst({
            where: { OR: [{ enrollmentNo: rollNo }, { universityRollNo: rollNo }] }
        });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const txnId = transactionId || `TXN-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;
        const existingTxn = await prisma.transaction.findUnique({ where: { transactionId: txnId } });
        if (existingTxn) return res.status(400).json({ success: false, message: 'Transaction ID already exists' });

        const transaction = await prisma.transaction.create({
            data: {
                studentId: student.id,
                feeType: 'BUS_FEE',
                amount,
                paymentMode,
                transactionId: txnId,
                paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                busRoute,
                createdById: req.user.id,
                paymentSource: paymentSource || student.fundingType
            }
        });

        await updateLedger(student.id, 'BUS_FEE', amount, paymentSource, busRoute);

        res.status(201).json({ success: true, message: 'Bus fee payment added successfully', data: transaction });
    } catch (error) { next(error); }
};

exports.addFine = async (req, res, next) => {
    try {
        const { rollNo, amount, paymentSource, paymentMode, transactionId, paymentDate, fineReason, fineDescription } = req.body;

        if (!rollNo || !amount || !paymentSource || !paymentMode) {
            return res.status(400).json({ success: false, message: 'Please provide rollNo, amount, paymentSource, paymentMode' });
        }
        if (amount <= 0) return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });

        const student = await prisma.student.findFirst({
            where: { OR: [{ enrollmentNo: rollNo }, { universityRollNo: rollNo }] }
        });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const txnId = transactionId || `TXN-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;
        const existingTxn = await prisma.transaction.findUnique({ where: { transactionId: txnId } });
        if (existingTxn) return res.status(400).json({ success: false, message: 'Transaction ID already exists' });

        const transaction = await prisma.transaction.create({
            data: {
                studentId: student.id,
                feeType: 'FINE',
                amount,
                paymentMode,
                transactionId: txnId,
                paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                fineReason,
                fineDescription,
                createdById: req.user.id,
                paymentSource: paymentSource || student.fundingType
            }
        });

        await updateLedger(student.id, 'FINE', amount, paymentSource);

        res.status(201).json({ success: true, message: 'Fine payment added successfully', data: transaction });
    } catch (error) { next(error); }
};

exports.editPayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount, paymentMode, paymentSource, transactionId, reason } = req.body;

        if (!reason) return res.status(400).json({ success: false, message: 'Please provide a reason for the edit' });

        const transaction = await prisma.transaction.findUnique({ where: { id } });
        if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

        const oldAmount = transaction.amount;
        const oldPaymentMode = transaction.paymentMode;
        const oldPaymentSource = transaction.paymentSource;
        const oldTransactionId = transaction.transactionId;

        const updateData = { updatedById: req.user.id };

        if (amount !== undefined) {
            if (amount <= 0) return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
            updateData.amount = amount;
        }

        if (paymentMode) updateData.paymentMode = paymentMode;
        if (paymentSource) updateData.paymentSource = paymentSource;
        
        if (transactionId) {
            const existingTxn = await prisma.transaction.findFirst({
                where: { transactionId, id: { not: id } }
            });
            if (existingTxn) return res.status(400).json({ success: false, message: 'Transaction ID already exists' });
            updateData.transactionId = transactionId;
        }

        const updatedTxn = await prisma.transaction.update({
            where: { id },
            data: updateData
        });

        await prisma.editHistory.create({
            data: {
                transactionId: updatedTxn.id,
                studentId: updatedTxn.studentId,
                oldAmount,
                newAmount: updatedTxn.amount,
                editedById: req.user.id,
                editedAt: new Date(),
                reason,
                oldPaymentMode,
                newPaymentMode: updatedTxn.paymentMode,
                oldPaymentSource,
                newPaymentSource: updatedTxn.paymentSource,
                oldTransactionId,
                newTransactionId: updatedTxn.transactionId
            }
        });

        const amountDiff = updatedTxn.amount - oldAmount;
        if (amountDiff !== 0) {
            await updateLedger(updatedTxn.studentId, updatedTxn.feeType, amountDiff, updatedTxn.paymentSource, null, true);
        }

        res.status(200).json({ success: true, message: 'Payment edited successfully', data: updatedTxn });
    } catch (error) { next(error); }
};

exports.getTransactions = async (req, res, next) => {
    try {
        const { rollNo } = req.params;
        const { feeType, startDate, endDate, page = 1, limit = 20 } = req.query;

        const student = await prisma.student.findFirst({
            where: { OR: [{ enrollmentNo: rollNo }, { universityRollNo: rollNo }] }
        });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const where = { studentId: student.id };
        if (feeType) where.feeType = feeType;
        if (startDate || endDate) {
            where.paymentDate = {};
            if (startDate) where.paymentDate.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.paymentDate.lte = end;
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                createdBy: { select: { email: true } },
                updatedBy: { select: { email: true } }
            },
            orderBy: { paymentDate: 'desc' },
            skip,
            take: parseInt(limit)
        });

        const total = await prisma.transaction.count({ where });
        const ledger = await prisma.studentLedger.findUnique({ where: { studentId: student.id } });

        res.status(200).json({
            success: true,
            data: {
                student: {
                    id: student.id, name: student.name,
                    enrollmentNo: student.enrollmentNo, universityRollNo: student.universityRollNo
                },
                ledger: ledger || { totalFee: 0, paidAmount: 0, pendingAmount: 0 },
                transactions,
                pagination: {
                    page: parseInt(page), limit: parseInt(limit),
                    total, pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) { next(error); }
};

exports.getEditHistory = async (req, res, next) => {
    try {
        const { rollNo } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const student = await prisma.student.findFirst({
            where: { OR: [{ enrollmentNo: rollNo }, { universityRollNo: rollNo }] }
        });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const history = await prisma.editHistory.findMany({
            where: { studentId: student.id },
            include: {
                transaction: true,
                editedBy: { select: { email: true } }
            },
            orderBy: { editedAt: 'desc' },
            skip, take: parseInt(limit)
        });

        const total = await prisma.editHistory.count({ where: { studentId: student.id } });

        res.status(200).json({
            success: true,
            data: {
                history,
                pagination: {
                    page: parseInt(page), limit: parseInt(limit),
                    total, pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) { next(error); }
};

const updateLedger = async (studentId, feeType, amount, paymentSource, busRoute = null, isAdjustment = false) => {
    let ledger = await prisma.studentLedger.findUnique({ where: { studentId } });
    if (!ledger) {
        ledger = await prisma.studentLedger.create({ data: { studentId } });
    }

    const sign = isAdjustment ? (amount < 0 ? -1 : 1) : 1;
    const absAmount = Math.abs(amount);
    
    // Parse JSON fields
    let collegeFee = typeof ledger.collegeFee === 'string' ? JSON.parse(ledger.collegeFee) : (ledger.collegeFee || { total: 0, paid: 0, pending: 0 });
    let busFee = typeof ledger.busFee === 'string' ? JSON.parse(ledger.busFee) : (ledger.busFee || { total: 0, paid: 0, pending: 0, route: '' });
    let fine = typeof ledger.fine === 'string' ? JSON.parse(ledger.fine) : (ledger.fine || { total: 0, paid: 0, pending: 0 });
    let paymentsBySource = typeof ledger.paymentsBySource === 'string' ? JSON.parse(ledger.paymentsBySource) : (ledger.paymentsBySource || { SELF: 0, DRCC: 0, SCHOLARSHIP: 0 });

    switch (feeType) {
        case 'COLLEGE_FEE':
            if (isAdjustment) collegeFee.paid += amount;
            else collegeFee.paid += absAmount;
            collegeFee.pending = collegeFee.total - collegeFee.paid;
            break;
        case 'BUS_FEE':
            if (isAdjustment) busFee.paid += amount;
            else busFee.paid += absAmount;
            busFee.pending = busFee.total - busFee.paid;
            if (busRoute) busFee.route = busRoute;
            break;
        case 'FINE':
            if (isAdjustment) fine.paid += amount;
            else fine.paid += absAmount;
            fine.pending = fine.total - fine.paid;
            break;
    }

    const paidAmount = collegeFee.paid + busFee.paid + fine.paid;
    const totalFee = collegeFee.total + busFee.total + fine.total;
    const pendingAmount = totalFee - paidAmount;

    if (paymentsBySource[paymentSource] !== undefined) {
        if (isAdjustment) paymentsBySource[paymentSource] += amount;
        else paymentsBySource[paymentSource] += absAmount;
    }

    const updatedLedger = await prisma.studentLedger.update({
        where: { id: ledger.id },
        data: {
            collegeFee, busFee, fine, paymentsBySource,
            paidAmount, totalFee, pendingAmount,
            lastPaymentDate: new Date(),
            lastPaymentAmount: absAmount
        }
    });

    return updatedLedger;
};
