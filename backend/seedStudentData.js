const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load Models
const Student = require('./src/models/Student');
const Section = require('./src/models/Section');
const Subject = require('./src/models/Subject');
const Faculty = require('./src/models/Faculty');
const Timetable = require('./src/models/Timetable');
const Mark = require('./src/models/Mark');
const Attendance = require('./src/models/Attendance');
const AcademicSession = require('./src/models/AcademicSession');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college_erp');
        console.log('MongoDB connected...');

        // 1. Get a target student
        let student = await Student.findOne().sort({ createdAt: -1 }).populate('section');
        if (!student) {
            console.log('No student found in DB. Creating a default test student...');

            // Find minimal requirements
            const section = await Section.findOne();
            const department = await require('./src/models/Department').findOne();
            const course = await require('./src/models/Course').findOne();
            const semester = await require('./src/models/Semester').findOne();

            if (!section || !department || !course || !semester) {
                console.log("Missing core academic data (Section, Dept, Course, Semester) to create a student.");
                process.exit(1);
            }

            const bcrypt = require('bcryptjs');
            const User = require('./src/models/User');
            const hashedPassword = await bcrypt.hash('password123', 10);

            const user = await User.create({ email: 'student@test.com', password: hashedPassword, role: 'STUDENT' });

            student = await Student.create({
                name: "Test Student Seeder",
                user: user._id,
                enrollmentNo: "112233",
                collegeRollNo: "112233",
                universityRollNo: "U112233",
                department: department._id,
                course: course._id,
                currentSemester: semester._id,
                section: section._id,
                batch: 'B1'
            });

            student = await Student.findById(student._id).populate('section');
            console.log('Created test student: student@test.com / password123');
        }
        console.log(`Targeting Student: ${student.name} (ID: ${student._id}) in Section: ${student.section.name}`);

        // 2. Clear old test data for this section
        await Timetable.deleteMany({ section: student.section._id });
        const marksQuery = await Mark.find({ section: student.section._id });
        const markIds = marksQuery.map(m => m._id);
        await Mark.deleteMany({ _id: { $in: markIds } });
        await Attendance.deleteMany({ section: student.section._id });
        console.log('Cleared existing Timetable, Marks, and Attendance for this section.');

        // 3. Get generic references (Subject, Faculty, Session)
        let subjects = await Subject.find().limit(3);
        let faculty = await Faculty.findOne();
        let session = await AcademicSession.findOne({ isActive: true });

        if (!session) {
            session = await AcademicSession.create({ year: '2024-2025', name: 'Fall 2024', startDate: new Date(), endDate: new Date(), isActive: true });
        }
        if (!faculty) {
            const bcrypt = require('bcryptjs');
            const user = await require('./src/models/User').create({ email: 'faculty@test.com', password: await bcrypt.hash('password123', 10), role: 'FACULTY' });
            faculty = await Faculty.create({ user: user._id, employeeId: 'F123', name: 'Test Faculty', department: student.department._id, designation: 'Professor' });
        }
        if (subjects.length < 1) {
            const s1 = await Subject.create({ name: 'Data Structures', code: 'CS101', department: student.department._id, credits: 4 });
            const s2 = await Subject.create({ name: 'Algorithms', code: 'CS102', department: student.department._id, credits: 4 });
            subjects = [s1, s2];
        }

        // --- TIMETABLE GENERATION ---
        const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
        const timetableEntries = [];
        let startTimeHour = 9;

        for (const day of days) {
            // Add 1-2 classes per day
            timetableEntries.push({
                section: student.section._id,
                dayOfWeek: day,
                startTime: `${startTimeHour}:00`,
                endTime: `${startTimeHour + 1}:00`,
                subject: subjects[0]._id,
                faculty: faculty._id,
                roomNo: `Room ${Math.floor(Math.random() * 100) + 100}`,
                batch: 'ALL'
            });

            if (subjects.length > 1 && Math.random() > 0.5) {
                timetableEntries.push({
                    section: student.section._id,
                    dayOfWeek: day,
                    startTime: `${startTimeHour + 1}:00`,
                    endTime: `${startTimeHour + 2}:00`,
                    subject: subjects[1]._id,
                    faculty: faculty._id,
                    roomNo: `Lab ${Math.floor(Math.random() * 10) + 1}`,
                    batch: student.batch || 'ALL'
                });
            }
        }
        await Timetable.insertMany(timetableEntries);
        console.log(`Seeded ${timetableEntries.length} timetable slots.`);

        // --- MARKS GENERATION ---
        const marksEntries = [];

        // Sessional Exams
        for (const subject of subjects) {
            marksEntries.push({
                examType: 'SESSIONAL',
                session: session._id,
                subject: subject._id,
                section: student.section._id,
                faculty: faculty._id,
                isLocked: true,
                maxMarks: 20,
                records: [{
                    student: student._id,
                    marksObtained: Math.floor(Math.random() * 8) + 12 // Random pass marks
                }]
            });
        }

        // Mid-Sem Exams for the available subjects
        for (let i = 0; i < Math.min(2, subjects.length); i++) {
            marksEntries.push({
                examType: 'MID_SEM',
                session: session._id,
                subject: subjects[i]._id,
                section: student.section._id,
                faculty: faculty._id,
                isLocked: true,
                maxMarks: 50,
                records: [{
                    student: student._id,
                    marksObtained: Math.floor(Math.random() * 20) + 25
                }]
            });
        }
        await Mark.insertMany(marksEntries);
        console.log(`Seeded ${marksEntries.length} locked exam mark records.`);

        // --- ATTENDANCE GENERATION ---
        const attendanceEntries = [];
        const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE']; // Higher chance of PRESENT

        // Generate past 7 days of attendance
        for (let i = 1; i <= 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            const targetSubject = subjects[Math.floor(Math.random() * subjects.length)];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

            attendanceEntries.push({
                session: session._id,
                date: date,
                section: student.section._id,
                subject: targetSubject._id,
                faculty: faculty._id,
                isLocked: true,
                records: [{
                    student: student._id,
                    status: randomStatus
                }]
            });
        }
        await Attendance.insertMany(attendanceEntries);
        console.log(`Seeded ${attendanceEntries.length} attendance records over the past week.`);

        console.log('✅ Seeding complete!');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
