const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');

const getAllStudents = async (where, pagination) => {
    const { skip, take } = pagination;
    const [students, total] = await Promise.all([
        prisma.student.findMany({
            where,
            include: {
                user: { select: { email: true } },
                department: { select: { name: true, code: true } },
                course: { select: { name: true } },
                currentSemester: { select: { name: true } },
                section: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take
        }),
        prisma.student.count({ where })
    ]);
    return { students, total };
};

const getStudentById = async (id) => {
    const student = await prisma.student.findUnique({
        where: { id },
        include: {
            user: { select: { email: true } },
            department: { select: { name: true, code: true } },
            course: { select: { name: true } },
            currentSemester: { select: { name: true } },
            section: { select: { name: true } }
        }
    });
    if (!student) throw new AppError('Student not found', 404);
    return student;
};

const createStudent = async (data) => {
    const { name, email, password, enrollmentNo, universityRollNo, phone, admissionDate, departmentId, courseId, currentSemesterId, sectionId, fundingType } = data;
    
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) throw new AppError('User already exists', 400);

    const enrollmentExists = await prisma.student.findUnique({ where: { enrollmentNo } });
    if (enrollmentExists) throw new AppError('Enrollment number already exists', 400);

    if (universityRollNo) {
        const rollNoExists = await prisma.student.findUnique({ where: { universityRollNo } });
        if (rollNoExists) throw new AppError('University roll number already exists', 400);
    }

    const sectionDoc = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!sectionDoc) throw new AppError('Section not found', 404);
    if (sectionDoc.currentRollIndex >= sectionDoc.capacity) {
        throw new AppError('Section Capacity Full', 400);
    }

    const finalEnrollmentNo = enrollmentNo || String(sectionDoc.baseRollNumber + sectionDoc.currentRollIndex);
    const halfCapacity = Math.ceil(sectionDoc.capacity / 2);
    const batch = sectionDoc.currentRollIndex < halfCapacity ? 'B1' : 'B2';

    const hashedPassword = await bcrypt.hash(password || finalEnrollmentNo, 10);

    const [user, student] = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
            data: { email, password: hashedPassword, role: 'STUDENT' }
        });
        const s = await tx.student.create({
            data: {
                userId: u.id,
                enrollmentNo: finalEnrollmentNo,
                universityRollNo,
                name,
                phone,
                admissionDate: admissionDate ? new Date(admissionDate) : null,
                departmentId,
                courseId,
                currentSemesterId,
                sectionId,
                batch,
                fundingType: fundingType || 'SELF'
            },
            include: {
                user: { select: { email: true } },
                department: { select: { name: true, code: true } },
                course: { select: { name: true } },
                currentSemester: { select: { name: true } },
                section: { select: { name: true } }
            }
        });
        await tx.section.update({
            where: { id: sectionId },
            data: { currentRollIndex: { increment: 1 } }
        });
        return [u, s];
    });

    return student;
};

const updateStudent = async (id, data) => {
    const studentExists = await prisma.student.findUnique({ where: { id } });
    if (!studentExists) throw new AppError('Student not found', 404);

    if (data.universityRollNo) {
        const rollNoExists = await prisma.student.findFirst({
            where: { universityRollNo: data.universityRollNo, id: { not: id } }
        });
        if (rollNoExists) throw new AppError('University roll number already exists', 400);
    }

    const student = await prisma.student.update({
        where: { id },
        data: {
            ...data,
            admissionDate: data.admissionDate ? new Date(data.admissionDate) : undefined
        },
        include: {
            user: { select: { email: true } },
            department: { select: { name: true, code: true } },
            course: { select: { name: true } },
            currentSemester: { select: { name: true } },
            section: { select: { name: true } }
        }
    });

    return student;
};

const deleteStudent = async (id) => {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) throw new AppError('Student not found', 404);

    await prisma.$transaction(async (tx) => {
        await tx.student.delete({ where: { id } });
        await tx.user.delete({ where: { id: student.userId } });
    });

    return true;
};

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};
