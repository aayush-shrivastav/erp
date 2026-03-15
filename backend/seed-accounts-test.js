const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Student = require('./src/models/Student');
const Course = require('./src/models/Course');
const Department = require('./src/models/Department');
const Semester = require('./src/models/Semester');
const Section = require('./src/models/Section');
const FeeStructure = require('./src/models/FeeStructure');
require('dotenv').config();

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eduerp');

        let accountantUser = await User.findOne({ email: 'accountant@test.com' });
        if (!accountantUser) {
            const hashedPassword = await bcrypt.hash('pass123', 10);
            accountantUser = await User.create({ email: 'accountant@test.com', password: hashedPassword, role: 'ACCOUNTS_ADMIN' });
            console.log('Created accountant user');
        }

        let department = await Department.findOne();
        if (!department) {
            department = await Department.create({ name: 'Computer Science ' + Date.now(), code: 'CS-' + Date.now() });
        }

        let course = await Course.findOne();
        if (!course) {
            course = await Course.create({ name: 'Test Course ' + Date.now(), code: 'C-' + Date.now(), durationYears: 4, totalSemesters: 8, department: department._id });
        }

        let semester = await Semester.findOne();
        if (!semester) {
            semester = await Semester.create({ name: 'Test Sem', number: 1, startDate: new Date(), endDate: new Date() });
        }

        let section = await Section.findOne();
        if (!section) {
            section = await Section.create({ name: 'A', capacity: 60, baseRollNumber: 2026001, currentRollIndex: 0 });
        }

        let studentUser = await User.findOne({ email: 'teststudent@test.com' });
        if (!studentUser) {
            const hashedPassword = await bcrypt.hash('pass123', 10);
            studentUser = await User.create({ email: 'teststudent@test.com', password: hashedPassword, role: 'STUDENT' });

            await Student.create({
                user: studentUser._id,
                enrollmentNo: 'T-' + Date.now(),
                name: 'Test Student',
                course: course._id,
                currentSemester: semester._id,
                section: section._id,
                batch: 'B1'
            });
            console.log('Created student profile');
        }

        let structure = await FeeStructure.findOne({ course: course._id, semester: semester._id });
        if (!structure) {
            await FeeStructure.create({
                course: course._id,
                semester: semester._id,
                tuitionFee: 50000,
                labFee: 5000,
                libraryFee: 2000,
                dueDate: new Date(new Date().setDate(new Date().getDate() - 5)),
                finePerDay: 100,
                maxFineLimit: 1000
            });
            console.log('Created fee structure');
        }

        console.log('Seed complete. You can login with accountant@test.com / pass123');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seed();
