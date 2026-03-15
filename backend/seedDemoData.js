require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Department = require('./src/models/Department');
const Course = require('./src/models/Course');
const AcademicSession = require('./src/models/AcademicSession');
const Semester = require('./src/models/Semester');
const Section = require('./src/models/Section');
const Subject = require('./src/models/Subject');
const Faculty = require('./src/models/Faculty');
const Student = require('./src/models/Student');
const SubjectAssignment = require('./src/models/SubjectAssignment');
const Timetable = require('./src/models/Timetable');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_erp';

async function seedDemoData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB for Demo Seeding...');

        // 0. Cleanup previous demo data 
        await User.deleteMany({ email: { $in: ['teacher@eduerp.com', 'student2026@eduerp.com', 'student2024@eduerp.com'] } });
        await Student.deleteMany({ $or: [{ enrollmentNo: { $in: ['2026001', '2024001'] } }, { universityRollNo: { $in: ['U2026001', 'U2024001'] } }] });
        await Faculty.deleteMany({ employeeId: 'EMP2026' });

        // 1. Ensure basic roles exist: admin, teacher, student
        const hashedPassword = await bcrypt.hash('password', 10);
        const adminPass = await bcrypt.hash('admin123', 10);
        const teacherPass = await bcrypt.hash('teacher123', 10);

        await User.updateOne({ email: 'admin@eduerp.com' }, { $set: { password: adminPass, role: 'SUPER_ADMIN', isActive: true } }, { upsert: true });

        // Generate users
        let teacherUser = await User.findOne({ email: 'teacher@eduerp.com' });
        if (!teacherUser) teacherUser = await User.create({ email: 'teacher@eduerp.com', password: teacherPass, role: 'FACULTY', isActive: true });
        else { teacherUser.password = teacherPass; await teacherUser.save(); }

        let student26User = await User.findOne({ email: 'student2026@eduerp.com' });
        if (!student26User) student26User = await User.create({ email: 'student2026@eduerp.com', password: hashedPassword, role: 'STUDENT', isActive: true });
        else { student26User.password = hashedPassword; await student26User.save(); }

        let student24User = await User.findOne({ email: 'student2024@eduerp.com' });
        if (!student24User) student24User = await User.create({ email: 'student2024@eduerp.com', password: hashedPassword, role: 'STUDENT', isActive: true });
        else { student24User.password = hashedPassword; await student24User.save(); }

        // 2. Academic Structure
        let dept = await Department.findOne({ code: 'CSE' });
        if (!dept) dept = await Department.create({ name: 'Computer Science and Engineering', code: 'CSE' });

        let course = await Course.findOne({ name: 'B.Tech CSE' });
        if (!course) course = await Course.create({ name: 'B.Tech CSE', department: dept._id, durationYears: 4, totalSemesters: 8 });

        let session = await AcademicSession.findOne({ isActive: true });
        if (!session) session = await AcademicSession.create({ year: '2026-2027', name: 'Spring 2026', startDate: new Date('2026-01-01'), endDate: new Date('2026-06-30'), isActive: true });

        let semester = await Semester.findOne({ course: course._id, level: 1 });
        if (!semester) semester = await Semester.create({ name: 'Semester 1', level: 1, course: course._id });

        let section = await Section.findOne({ semester: semester._id, name: 'A' });
        if (!section) section = await Section.create({ name: 'A', semester: semester._id, department: dept._id, course: course._id, baseRollNumber: 26001, capacity: 60, currentRollIndex: 0 });

        let subject = await Subject.findOne({ code: 'CS101' });
        if (!subject) subject = await Subject.create({ name: 'Programming in C', code: 'CS101', department: dept._id, credits: 4 });

        // 3. Faculty Profile
        let faculty = await Faculty.findOne({ user: teacherUser._id });
        if (!faculty) faculty = await Faculty.create({ user: teacherUser._id, employeeId: 'EMP2026', name: 'Dr. Neha Sharma', department: dept._id, designation: 'Assistant Professor', contactNumber: '9999999991' });

        // 4. Student Profiles
        let student26 = await Student.findOne({ user: student26User._id });
        if (!student26) {
            student26 = await Student.create({
                user: student26User._id, enrollmentNo: '2026001', universityRollNo: 'U2026001', name: 'Ayush Kumar (2026)',
                department: dept._id, course: course._id, currentSemester: semester._id, section: section._id, batch: 'B1'
            });
            await Section.findByIdAndUpdate(section._id, { $inc: { currentRollIndex: 1 } });
        }

        let student24 = await Student.findOne({ user: student24User._id });
        if (!student24) {
            student24 = await Student.create({
                user: student24User._id, enrollmentNo: '2024001', universityRollNo: 'U2024001', name: 'Rahul Singh (2024)',
                department: dept._id, course: course._id, currentSemester: semester._id, section: section._id, batch: 'B2'
            });
            await Section.findByIdAndUpdate(section._id, { $inc: { currentRollIndex: 1 } });
        }

        // 5. Connect Teacher, Class, Subject
        let assignment = await SubjectAssignment.findOne({ faculty: faculty._id, subject: subject._id, section: section._id });
        if (!assignment) {
            await SubjectAssignment.create({ faculty: faculty._id, subject: subject._id, section: section._id });
        }

        // Add class teacher info
        section.classTeacher = faculty._id;
        await section.save();

        // 6. Timetable
        let timetable = await Timetable.findOne({ section: section._id, dayOfWeek: 'MONDAY' });
        if (!timetable) {
            await Timetable.create({
                section: section._id,
                dayOfWeek: 'MONDAY',
                startTime: '09:00',
                endTime: '10:00',
                subject: subject._id,
                faculty: faculty._id,
                roomNo: 'Lab 1',
                batch: 'ALL'
            });
            await Timetable.create({
                section: section._id,
                dayOfWeek: 'TUESDAY',
                startTime: '10:00',
                endTime: '11:00',
                subject: subject._id,
                faculty: faculty._id,
                roomNo: 'Room 101',
                batch: 'ALL'
            });
        }

        console.log('✅ Demo Data Seeded Successfully!');
        console.log('Admin:', 'admin@eduerp.com / admin123');
        console.log('Teacher:', 'teacher@eduerp.com / teacher123');
        console.log('Student:', 'student2026@eduerp.com / password');

        process.exit(0);
    } catch (err) {
        console.error('Error seeding demo data:', err);
        if (err.errors) console.error(err.errors);
        process.exit(1);
    }
}

seedDemoData();
