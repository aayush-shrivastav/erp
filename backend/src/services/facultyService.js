const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');

const getAllFaculty = async (pagination) => {
    const { skip, take } = pagination;
    const [faculty, total] = await Promise.all([
        prisma.faculty.findMany({
            include: {
                user: { select: { email: true } },
                department: { select: { name: true, code: true } },
                facultySubjects: { 
                    include: { 
                        subject: { select: { name: true, code: true, type: true } } 
                    } 
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take
        }),
        prisma.faculty.count()
    ]);
    return { faculty, total };
};

const createFaculty = async (data) => {
    const { email, employeeId, name, phone, designation, joiningDate, departmentId, password } = data;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) throw new AppError('User already exists', 400);

    const employeeExists = await prisma.faculty.findUnique({ where: { employeeId } });
    if (employeeExists) throw new AppError('Employee ID already exists', 400);

    const hashedPassword = await bcrypt.hash(password || employeeId, 10);

    const faculty = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: { email, password: hashedPassword, role: 'FACULTY' }
        });

        return await tx.faculty.create({
            data: {
                userId: user.id,
                employeeId,
                name,
                phone,
                designation,
                joiningDate: joiningDate ? new Date(joiningDate) : null,
                departmentId
            }
        });
    });

    return faculty;
};

const updateFaculty = async (id, data) => {
    const facultyExists = await prisma.faculty.findUnique({ where: { id } });
    if (!facultyExists) throw new AppError('Faculty not found', 404);

    if (data.employeeId) {
        const employeeExists = await prisma.faculty.findFirst({
            where: { employeeId: data.employeeId, id: { not: id } }
        });
        if (employeeExists) throw new AppError('Employee ID already exists', 400);
    }

    const faculty = await prisma.faculty.update({
        where: { id },
        data: {
            ...data,
            joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined
        }
    });

    return faculty;
};

const deleteFaculty = async (id) => {
    const faculty = await prisma.faculty.findUnique({ where: { id } });
    if (!faculty) throw new AppError('Faculty not found', 404);

    await prisma.$transaction(async (tx) => {
        await tx.faculty.delete({ where: { id } });
        await tx.user.delete({ where: { id: faculty.userId } });
    });

    return true;
};

const assignSubjects = async (facultyId, subjectIds) => {
    const subjects = subjectIds.map(id => ({
        facultyId,
        subjectId: id
    }));
    
    await prisma.facultySubject.createMany({
        data: subjects,
        skipDuplicates: true
    });

    const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
        include: { facultySubjects: { include: { subject: true } } }
    });
    
    return faculty;
};

module.exports = {
    getAllFaculty,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    assignSubjects
};
