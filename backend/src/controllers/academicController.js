const prisma = require('../config/prisma');

// ================= DEPARTMENTS =================

exports.createDepartment = async (req, res, next) => {
    try {
        const { name, code, description, isActive } = req.body;
        
        // Validation
        if (!name || !code) {
            return res.status(400).json({ 
                success: false, 
                message: 'Department name and code are required' 
            });
        }
        
        // Check if department with same name or code already exists
        const existingDept = await prisma.department.findFirst({
            where: {
                OR: [
                    { name: name },
                    { code: code }
                ]
            }
        });
        
        if (existingDept) {
            return res.status(400).json({ 
                success: false, 
                message: `Department with this ${existingDept.name === name ? 'name' : 'code'} already exists` 
            });
        }
        
        const department = await prisma.department.create({ 
            data: { 
                name, 
                code, 
                description: description || null,
                isActive: isActive !== undefined ? isActive : true
            },
            include: {
                headOfDepartment: {
                    select: { user: true, employeeId: true }
                }
            }
        });
        
        res.status(201).json({ success: true, data: department, message: 'Department created successfully' });
    } catch (error) { next(error); }
};

exports.getDepartments = async (req, res, next) => {
    try {
        const departments = await prisma.department.findMany({
            include: {
                headOfDepartment: {
                    select: { user: true, employeeId: true }
                }
            }
        });
        res.status(200).json({ success: true, count: departments.length, data: departments });
    } catch (error) { next(error); }
};

exports.assignHOD = async (req, res, next) => {
    try {
        const { facultyId } = req.body;
        const department = await prisma.department.update({
            where: { id: req.params.id },
            data: { headOfDepartmentId: facultyId },
            include: { headOfDepartment: { select: { user: true, employeeId: true } } }
        });

        res.status(200).json({ success: true, data: department });
    } catch (error) { next(error); }
};

exports.updateDepartment = async (req, res, next) => {
    try {
        const { name, code, description, isActive } = req.body;
        const departmentId = req.params.id;
        
        // Validation
        if (!name || !code) {
            return res.status(400).json({ 
                success: false, 
                message: 'Department name and code are required' 
            });
        }
        
        // Check if another department with same name or code already exists
        const existingDept = await prisma.department.findFirst({
            where: {
                AND: [
                    { id: { not: departmentId } },
                    {
                        OR: [
                            { name: name },
                            { code: code }
                        ]
                    }
                ]
            }
        });
        
        if (existingDept) {
            return res.status(400).json({ 
                success: false, 
                message: `Another department with this ${existingDept.name === name ? 'name' : 'code'} already exists` 
            });
        }
        
        const department = await prisma.department.update({
            where: { id: departmentId },
            data: { 
                name, 
                code, 
                description: description || null,
                isActive: isActive !== undefined ? isActive : true
            },
            include: {
                headOfDepartment: {
                    select: { user: true, employeeId: true }
                }
            }
        });
        
        res.status(200).json({ success: true, data: department, message: 'Department updated successfully' });
    } catch (error) { next(error); }
};

exports.deleteDepartment = async (req, res, next) => {
    try {
        const departmentId = req.params.id;
        
        // Check if department has any related records
        const [courses, students, faculty] = await Promise.all([
            prisma.course.count({ where: { departmentId } }),
            prisma.student.count({ where: { departmentId } }),
            prisma.faculty.count({ where: { departmentId } })
        ]);
        
        if (courses > 0 || students > 0 || faculty > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete department. It has associated courses, students, or faculty members.' 
            });
        }
        
        await prisma.department.delete({ where: { id: departmentId } });
        res.status(200).json({ success: true, message: 'Department deleted successfully' });
    } catch (error) { next(error); }
};

// ================= COURSES =================

exports.createCourse = async (req, res, next) => {
    try {
        const course = await prisma.course.create({ data: req.body });

        const semestersToCreate = [];
        for (let i = 1; i <= course.totalSemesters; i++) {
            semestersToCreate.push({
                name: `Semester ${i}`,
                level: i,
                courseId: course.id
            });
        }
        await prisma.semester.createMany({ data: semestersToCreate });

        res.status(201).json({ success: true, data: course });
    } catch (error) { next(error); }
};

exports.getCourses = async (req, res, next) => {
    try {
        const courses = await prisma.course.findMany({
            include: { department: { select: { name: true, code: true } } }
        });
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) { next(error); }
};

// ================= ACADEMIC SESSIONS =================

exports.createSession = async (req, res, next) => {
    try {
        const session = await prisma.academicSession.create({ data: req.body });
        res.status(201).json({ success: true, data: session });
    } catch (error) { next(error); }
};

exports.getSessions = async (req, res, next) => {
    try {
        const sessions = await prisma.academicSession.findMany();
        res.status(200).json({ success: true, count: sessions.length, data: sessions });
    } catch (error) { next(error); }
};

exports.activateSession = async (req, res, next) => {
    try {
        await prisma.academicSession.updateMany({ data: { isActive: false } });
        const session = await prisma.academicSession.update({
            where: { id: req.params.id },
            data: { isActive: true }
        });

        const students = await prisma.student.findMany({
            where: { isPassout: false },
            include: { currentSemester: true }
        });

        for (let student of students) {
            if (!student.currentSemester) continue;

            const currentLevel = student.currentSemester.level || parseInt(student.currentSemester.name.replace('Semester ', ''));
            const course = await prisma.course.findUnique({ where: { id: student.courseId } });

            if (!course) continue;

            if (currentLevel >= course.totalSemesters) {
                await prisma.student.update({ where: { id: student.id }, data: { isPassout: true } });
            } else {
                const nextSemester = await prisma.semester.findFirst({
                    where: {
                        courseId: student.courseId,
                        level: currentLevel + 1
                    }
                });

                if (nextSemester) {
                    await prisma.student.update({ where: { id: student.id }, data: { currentSemesterId: nextSemester.id } });
                }
            }
        }

        res.status(200).json({ success: true, data: session });
    } catch (error) { next(error); }
};

exports.updateSession = async (req, res, next) => {
    try {
        const session = await prisma.academicSession.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.status(200).json({ success: true, data: session, message: 'Session updated successfully' });
    } catch (error) { next(error); }
};

exports.deleteSession = async (req, res, next) => {
    try {
        await prisma.academicSession.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, message: 'Session deleted successfully' });
    } catch (error) { next(error); }
};

// ================= SEMESTERS =================

exports.createSemester = async (req, res, next) => {
    try {
        const semester = await prisma.semester.create({ data: req.body });
        res.status(201).json({ success: true, data: semester });
    } catch (error) { next(error); }
};

exports.getSemesters = async (req, res, next) => {
    try {
        const where = {};
        if (req.query.course) where.courseId = req.query.course;

        const semesters = await prisma.semester.findMany({
            where,
            include: { course: { select: { name: true } } }
        });
        res.status(200).json({ success: true, count: semesters.length, data: semesters });
    } catch (error) { next(error); }
};

exports.updateSemester = async (req, res, next) => {
    try {
        const semester = await prisma.semester.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.status(200).json({ success: true, data: semester, message: 'Semester updated successfully' });
    } catch (error) { next(error); }
};

exports.deleteSemester = async (req, res, next) => {
    try {
        await prisma.semester.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, message: 'Semester deleted successfully' });
    } catch (error) { next(error); }
};

// Update and Delete Course Functions
exports.updateCourse = async (req, res, next) => {
    try {
        const course = await prisma.course.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.status(200).json({ success: true, data: course, message: 'Course updated successfully' });
    } catch (error) { next(error); }
};

exports.deleteCourse = async (req, res, next) => {
    try {
        // First delete all semesters associated with this course
        await prisma.semester.deleteMany({
            where: { courseId: req.params.id }
        });
        
        // Then delete the course
        await prisma.course.delete({
            where: { id: req.params.id }
        });
        
        res.status(200).json({ success: true, message: 'Course and associated semesters deleted successfully' });
    } catch (error) { next(error); }
};
