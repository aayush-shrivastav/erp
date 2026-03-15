const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
    try {
        console.log('Starting simplified seeding for Demo Users...');
        const hashedPassword = await bcrypt.hash('pass123', 10);

        // 1. Base Setup (Department, Course, Session, Semester, Section)
        let dept = await prisma.department.findFirst();
        if (!dept) {
            dept = await prisma.department.create({ data: { name: 'Computer Science', code: 'CSE' } });
        }

        let course = await prisma.course.findFirst();
        if (!course) {
            course = await prisma.course.create({ data: { name: 'B.Tech CSE', departmentId: dept.id, durationYears: 4, totalSemesters: 8 } });
        }

        let session = await prisma.academicSession.findFirst();
        if (!session) {
            session = await prisma.academicSession.create({ data: { year: '2024-2025', isActive: true } });
        }

        let semester = await prisma.semester.findFirst();
        if (!semester) {
            semester = await prisma.semester.create({ data: { name: 'Semester 1', level: 1, courseId: course.id, sessionId: session.id } });
        }

        let section = await prisma.section.findFirst();
        if (!section) {
            section = await prisma.section.create({ data: { name: 'A', departmentId: dept.id, semesterId: semester.id, courseId: course.id, capacity: 60, baseRollNumber: 2024001 } });
        }

        // 2. Create Accountant
        let accountant = await prisma.user.findUnique({ where: { email: 'accountant@test.com' } });
        if (!accountant) {
            await prisma.user.create({ data: { email: 'accountant@test.com', password: hashedPassword, role: 'ACCOUNTS_ADMIN' } });
            console.log('Created Accountant: accountant@test.com / pass123');
        }

        // 3. Create Faculty
        let facultyUser = await prisma.user.findUnique({ where: { email: 'teacher@test.com' } });
        if (!facultyUser) {
            facultyUser = await prisma.user.create({ data: { email: 'teacher@test.com', password: hashedPassword, role: 'FACULTY' } });
            await prisma.faculty.create({
                data: {
                    userId: facultyUser.id,
                    employeeId: 'EMP' + Date.now(),
                    name: 'Demo Teacher',
                    departmentId: dept.id
                }
            });
            console.log('Created Teacher: teacher@test.com / pass123');
        }

        // 4. Create Student
        let studentUser = await prisma.user.findUnique({ where: { email: 'student@test.com' } });
        if (!studentUser) {
            studentUser = await prisma.user.create({ data: { email: 'student@test.com', password: hashedPassword, role: 'STUDENT' } });
            await prisma.student.create({
                data: {
                    userId: studentUser.id,
                    enrollmentNo: 'ENR' + Date.now(),
                    name: 'Demo Student',
                    departmentId: dept.id,
                    courseId: course.id,
                    currentSemesterId: semester.id,
                    sectionId: section.id,
                    batch: 'B1'
                }
            });
            console.log('Created Student: student@test.com / pass123');
        }

        console.log('Seeding Complete! You can now use these credentials.');
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
