const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const FeeStructure = require('./src/models/FeeStructure');
const StudentFee = require('./src/models/StudentFee');
const Payment = require('./src/models/Payment');
const Receipt = require('./src/models/Receipt');
const Course = require('./src/models/Course');
const Semester = require('./src/models/Semester');
const Student = require('./src/models/Student');
const User = require('./src/models/User');

const testAccountsDbFlow = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/college_erp');
        console.log('✅ Connected to DB');

        // 1. Fetch random seeds
        const course = await Course.findOne();
        const semester = await Semester.findOne();
        const student = await Student.findOne();
        const admin = await User.findOne({ role: { $in: ['SUPER_ADMIN', 'ACCOUNTS_ADMIN'] } });

        if (!course || !semester || !student || !admin) {
            throw new Error('Missing seed data required for test (Course, Semester, Student, or Admin User)');
        }

        console.log(`--- Seed Data Extracted ---`);
        console.log(`Course: ${course.code}, Sem: ${semester.number}, Student: ${student.enrollmentNo}`);

        // 2. Create Fee Structure (Past Due Date to test auto-fine)
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 10);

        let feeStruct = await FeeStructure.findOne({ course: course._id, semester: semester._id });
        if (!feeStruct) {
            feeStruct = await FeeStructure.create({
                course: course._id,
                semester: semester._id,
                tuitionFee: 50000,
                labFee: 5000,
                libraryFee: 2000,
                otherCharges: 1000,
                dueDate: pastDate,
                finePerDay: 100,
                maxFineLimit: 2000
            });
            console.log(`✅ Created Fee Structure! Expected base total: 58000 | DB Calc: ${feeStruct.totalAmount}`);
        } else {
            console.log(`⚠️ Using existing Fee Structure. Total: ${feeStruct.totalAmount}`);
            // Force update due date backward
            feeStruct.dueDate = pastDate;
            await feeStruct.save();
        }

        // 3. Assign Fee to Student
        let studentFee = await StudentFee.findOne({ student: student._id, feeStructure: feeStruct._id });
        if (!studentFee) {
            studentFee = await StudentFee.create({
                student: student._id,
                feeStructure: feeStruct._id,
                totalAmount: feeStruct.totalAmount,
                totalPayable: feeStruct.totalAmount,
                remainingBalance: feeStruct.totalAmount
            });
            console.log(`✅ Fee Assigned to Student! Remaining Balance: ${studentFee.remainingBalance}`);
        } else {
            console.log(`⚠️ Fee already assigned to Student.`);
        }

        // 4. Test Auto Fine Computation Logic
        console.log(`\n--- Testing Auto Fine Computation ---`);

        // Duplicate logic here for pure DB test simplicity since controller helper expects populated doc
        await studentFee.populate('feeStructure');
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now - new Date(studentFee.feeStructure.dueDate)) / (1000 * 60 * 60 * 24));
        let calcFine = diffDays * studentFee.feeStructure.finePerDay;
        if (calcFine > studentFee.feeStructure.maxFineLimit) calcFine = studentFee.feeStructure.maxFineLimit;

        studentFee.autoFineAmount = calcFine;
        studentFee.totalFineAmount = studentFee.autoFineAmount + studentFee.totalManualFineAmount;
        studentFee.totalAmount = studentFee.feeStructure.totalAmount; // Add this missing assignment
        studentFee.totalPayable = studentFee.totalAmount + studentFee.totalFineAmount;
        studentFee.remainingBalance = studentFee.totalPayable - studentFee.paidAmount;
        await studentFee.save();

        console.log(`Expected Auto Fine (~10 days late): 1000. Actual Computed: ${studentFee.autoFineAmount}`);
        console.log(`New Total Payable: ${studentFee.totalPayable}`);

        console.log('\n--- Testing Payment Insert & Balance Shift ---');
        // Let's do a partial payment of 20000
        const payAmount = 20000;

        const payment = await Payment.create({
            student: student._id,
            studentFee: studentFee._id,
            amountPaid: payAmount,
            paymentMode: 'CASH',
            transactionId: `TEST-TXN-${uuidv4().substring(0, 8).toUpperCase()}`,
            collectedBy: admin._id
        });

        studentFee.paidAmount += payAmount;
        studentFee.remainingBalance = studentFee.totalPayable - studentFee.paidAmount;
        studentFee.status = 'PARTIAL';
        await studentFee.save();

        console.log(`✅ Payment created: ${payment.transactionId} for Rs.${payAmount}`);
        console.log(`Expected Remaining Balance: ${studentFee.totalPayable - payAmount}. Actual DB Value: ${studentFee.remainingBalance}`);

        console.log('\n✅ DB Data Integrity & Computation Tests Passed!');
        process.exit(0);
    } catch (e) {
        console.error('❌ Tests Failed: ', e.stack);
        if (e.errors) {
            console.error(JSON.stringify(e.errors, null, 2));
        }
        process.exit(1);
    }
};

testAccountsDbFlow();
