const prisma = require('../config/prisma');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const receiptsDir = path.join(__dirname, '..', '..', 'public', 'receipts');
if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
}

exports.processPayment = async (req, res, next) => {
    try {
        const { studentFeeId, amountPaid, paymentMode, transactionId, paymentDate, paymentSource } = req.body;

        if (!amountPaid || amountPaid <= 0) {
            return res.status(400).json({ success: false, message: 'Payment amount must be greater than 0' });
        }

        const fee = await prisma.studentFee.findUnique({
            where: { id: studentFeeId },
            include: { student: true, feeStructure: true }
        });
        if (!fee) return res.status(404).json({ success: false, message: 'Fee invoice record not found' });

        if (fee.status === 'PAID' || fee.remainingBalance <= 0) {
            return res.status(400).json({ success: false, message: 'Fee is already fully paid' });
        }

        if (amountPaid > fee.remainingBalance) {
            return res.status(400).json({ success: false, message: `Cannot overpay. Maximum allowable amount is ${fee.remainingBalance}` });
        }

        if (transactionId) {
            const existingTx = await prisma.payment.findUnique({ where: { transactionId } });
            if (existingTx) {
                return res.status(400).json({ success: false, message: 'Duplicate transaction ID detected' });
            }
        }

        const finalPaymentSource = paymentSource || fee.student.fundingType || 'SELF';
        const receiptNo = `RCPT-${new Date().getFullYear()}-${uuidv4().substring(0, 8).toUpperCase()}`;

        const payment = await prisma.payment.create({
            data: {
                receiptNo,
                studentId: fee.student.id,
                studentFeeId: fee.id,
                amountPaid,
                paymentMode,
                paymentSource: finalPaymentSource,
                transactionId: transactionId || `TXN-${uuidv4().substring(0, 8).toUpperCase()}`,
                paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                createdById: req.user.id,
                collectedById: req.user.id
            }
        });

        let pendingFine = fee.totalFineAmount;
        let finePaid = amountPaid >= pendingFine ? pendingFine : amountPaid;
        let basePaid = amountPaid >= pendingFine ? amountPaid - pendingFine : 0;

        const newPaidAmount = fee.paidAmount + amountPaid;
        const newRemainingBalance = fee.totalPayable - newPaidAmount;
        let newStatus = 'UNPAID';
        if (newRemainingBalance === 0) newStatus = 'PAID';
        else if (newPaidAmount > 0) newStatus = 'PARTIAL';

        await prisma.studentFee.update({
            where: { id: fee.id },
            data: {
                paidAmount: newPaidAmount,
                remainingBalance: newRemainingBalance,
                status: newStatus
            }
        });

        const pdfFileName = `${receiptNo}.pdf`;
        const pdfPath = path.join(receiptsDir, pdfFileName);

        const receipt = await prisma.receipt.create({
            data: {
                receiptNumber: receiptNo,
                studentId: fee.student.id,
                paymentId: payment.id,
                amountPaid,
                paymentMode,
                transactionId: payment.transactionId,
                paymentDate: payment.paymentDate,
                baseFeePaid: basePaid,
                finePaid: finePaid,
                remainingBalance: newRemainingBalance,
                pdfUrl: `/receipts/${pdfFileName}`
            }
        });

        generatePDFReceipt(receipt, fee, payment, pdfPath);
        res.status(201).json({ success: true, data: { payment, receipt } });
    } catch (error) { next(error); }
};

const generatePDFReceipt = (receipt, fee, payment, filePath) => {
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(20).text('College ERP System', { align: 'center' });
    doc.fontSize(12).text('Official Fee Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Receipt No: ${receipt.receiptNumber}`);
    doc.text(`Date: ${new Date(receipt.paymentDate).toLocaleDateString()}`);
    doc.text(`Transaction ID: ${receipt.transactionId || 'N/A'}`);
    doc.text(`Payment Mode: ${receipt.paymentMode}`);
    doc.text(`Payment Source: ${payment.paymentSource}`);
    doc.moveDown();
    doc.rect(50, 160, 500, 0).stroke();
    doc.moveDown();
    doc.fontSize(12).text('Student Details', { underline: true });
    doc.fontSize(10).text(`Name: ${fee.student.name || 'Student Name'}`);
    doc.text(`Enrollment No: ${fee.student.enrollmentNo || 'N/A'}`);
    doc.moveDown();
    doc.fontSize(12).text('Fee Breakdown', { underline: true });
    doc.fontSize(10).text(`Tuition Fee: Rs. ${fee.feeStructure.tuitionFee}`);
    doc.text(`Lab Fee: Rs. ${fee.feeStructure.labFee}`);
    doc.text(`Library Fee: Rs. ${fee.feeStructure.libraryFee}`);
    doc.text(`Other Charges: Rs. ${fee.feeStructure.otherCharges}`);
    doc.text(`-------------------------`);
    doc.text(`Total Base Fee: Rs. ${fee.feeStructure.totalAmount}`);
    doc.text(`Total Fine Applied: Rs. ${fee.totalFineAmount}`);
    doc.text(`Net Payable: Rs. ${fee.totalPayable}`);
    doc.moveDown();
    doc.rect(50, 380, 500, 0).stroke();
    doc.moveDown();
    doc.fontSize(14).text(`Amount Paid This Transaction: Rs. ${receipt.amountPaid}`, { bold: true });
    doc.fontSize(12).text(`Remaining Balance: Rs. ${receipt.remainingBalance}`, { color: 'red' });
    doc.moveDown(4);
    doc.fontSize(10).text('Authorized Signature', { align: 'right' });
    doc.end();
};

exports.getPayments = async (req, res, next) => {
    try {
        const payments = await prisma.payment.findMany({
            where: { isReversed: false },
            include: {
                student: { select: { name: true, enrollmentNo: true } },
                collectedBy: { select: { email: true } }
            },
            orderBy: { paymentDate: 'desc' }
        });
        res.status(200).json({ success: true, count: payments.length, data: payments });
    } catch (err) { next(err); }
};

exports.downloadReceipt = async (req, res, next) => {
    try {
        const receipt = await prisma.receipt.findUnique({ where: { id: req.params.receiptId } });
        if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
        const filePath = path.join(__dirname, '..', '..', 'public', receipt.pdfUrl);
        if (fs.existsSync(filePath)) {
            res.download(filePath);
        } else {
            res.status(404).json({ message: 'PDF file missing from server' });
        }
    } catch (err) { next(err); }
};

exports.reversePayment = async (req, res, next) => {
    try {
        const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        if (payment.isReversed) return res.status(400).json({ success: false, message: 'Payment is already reversed' });

        await prisma.payment.update({
            where: { id: payment.id },
            data: { isReversed: true, updatedById: req.user.id, status: 'REFUNDED' }
        });

        const fee = await prisma.studentFee.findUnique({ where: { id: payment.studentFeeId } });
        if (fee) {
            let newPaid = fee.paidAmount - payment.amountPaid;
            if (newPaid < 0) newPaid = 0;
            const newBal = fee.totalPayable - newPaid;
            let newStatus = 'UNPAID';
            if (newBal === 0) newStatus = 'PAID';
            else if (newPaid > 0) newStatus = 'PARTIAL';

            await prisma.studentFee.update({
                where: { id: fee.id },
                data: { paidAmount: newPaid, remainingBalance: newBal, status: newStatus }
            });
        }
        res.status(200).json({ success: true, message: 'Payment successfully reversed' });
    } catch (err) { next(err); }
};
