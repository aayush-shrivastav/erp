const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

exports.createStudent = async (req, res, next) => {
    try {
        const { name, email, password, enrollmentNo, universityRollNo, phone, admissionDate, departmentId, courseId, currentSemesterId, sectionId, fundingType } = req.body;
        const normalizedUniversityRollNo = typeof universityRollNo === 'string' ? universityRollNo.trim() : universityRollNo;
        const safeUniversityRollNo = normalizedUniversityRollNo || null;

        // Validation
        if (!name || !email || !enrollmentNo || !departmentId || !courseId || !currentSemesterId || !sectionId) {
            return res.status(400).json({ success: false, message: 'All required fields must be provided' });
        }

        // Check if user already exists
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });

        // Check if enrollment number already exists
        const enrollmentExists = await prisma.student.findUnique({ where: { enrollmentNo } });
        if (enrollmentExists) return res.status(400).json({ success: false, message: 'Enrollment number already exists' });

        // Check if university roll number already exists
        if (safeUniversityRollNo) {
            const rollNoExists = await prisma.student.findUnique({ where: { universityRollNo: safeUniversityRollNo } });
            if (rollNoExists) return res.status(400).json({ success: false, message: 'University roll number already exists' });
        }

        // Validate section exists and has capacity
        const sectionDoc = await prisma.section.findUnique({ where: { id: sectionId } });
        if (!sectionDoc) return res.status(404).json({ success: false, message: 'Section not found' });
        if (sectionDoc.currentRollIndex >= sectionDoc.capacity) {
            return res.status(400).json({ success: false, message: 'Section Capacity Full' });
        }

        // Auto-generate enrollment number if not provided
        const finalEnrollmentNo = enrollmentNo || String(sectionDoc.baseRollNumber + sectionDoc.currentRollIndex);
        const halfCapacity = Math.ceil(sectionDoc.capacity / 2);
        const batch = sectionDoc.currentRollIndex < halfCapacity ? 'B1' : 'B2';

        // Hash password
        const hashedPassword = await bcrypt.hash(password || finalEnrollmentNo, 10);

        // Create user
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, role: 'STUDENT' }
        });

        // Create student
        const student = await prisma.student.create({
            data: {
                userId: user.id,
                enrollmentNo: finalEnrollmentNo,
                universityRollNo: safeUniversityRollNo,
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

        // Update section roll index
        await prisma.section.update({
            where: { id: sectionId },
            data: { currentRollIndex: { increment: 1 } }
        });

        res.status(201).json({ success: true, data: student, message: 'Student created successfully' });
    } catch (error) {
        console.error('Create student error:', error);
        next(error);
    }
};

exports.bulkImportStudents = async (req, res, next) => {
    try {
        const studentsData = req.body.students;
        const results = [];
        const sectionsCache = {};

        for (let data of studentsData) {
            const userExists = await prisma.user.findUnique({ where: { email: data.email } });
            if (userExists) continue;

            if (!sectionsCache[data.sectionId]) {
                const sec = await prisma.section.findUnique({ where: { id: data.sectionId } });
                if (!sec) continue;
                sectionsCache[data.sectionId] = sec;
            }

            const sectionDoc = sectionsCache[data.sectionId];
            if (sectionDoc.currentRollIndex >= sectionDoc.capacity) continue;

            const enrollmentNo = String(sectionDoc.baseRollNumber + sectionDoc.currentRollIndex);
            const halfCapacity = Math.ceil(sectionDoc.capacity / 2);
            const batch = sectionDoc.currentRollIndex < halfCapacity ? 'B1' : 'B2';

            const hashedPassword = await bcrypt.hash(enrollmentNo, 10);
            const user = await prisma.user.create({
                data: { email: data.email, password: hashedPassword, role: 'STUDENT' }
            });

            const student = await prisma.student.create({
                data: {
                    userId: user.id,
                    enrollmentNo,
                    name: data.name,
                    departmentId: data.departmentId,
                    courseId: data.courseId,
                    currentSemesterId: data.semesterId,
                    sectionId: data.sectionId,
                    batch,
                    fundingType: data.fundingType || 'SELF'
                }
            });

            sectionDoc.currentRollIndex += 1;
            results.push(student);
        }

        for (const secId in sectionsCache) {
            await prisma.section.update({
                where: { id: secId },
                data: { currentRollIndex: sectionsCache[secId].currentRollIndex }
            });
        }

        res.status(201).json({ success: true, count: results.length });
    } catch (error) { next(error); }
};

exports.getStudents = async (req, res, next) => {
    try {
        const where = {};
        if (req.query.section) where.sectionId = req.query.section;
        if (req.query.course) where.courseId = req.query.course;
        if (req.query.semester) where.currentSemesterId = req.query.semester;

        if (req.query.search) {
            where.OR = [
                { name: { contains: req.query.search, mode: 'insensitive' } },
                { enrollmentNo: { contains: req.query.search, mode: 'insensitive' } },
                { universityRollNo: { contains: req.query.search, mode: 'insensitive' } },
                { user: { email: { contains: req.query.search, mode: 'insensitive' } } }
            ];
        }

        const students = await prisma.student.findMany({
            where,
            include: {
                user: { select: { email: true } },
                department: { select: { name: true, code: true } },
                course: { select: { name: true } },
                currentSemester: { select: { name: true } },
                section: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (error) {
        console.error('Get students error:', error);
        next(error);
    }
};

exports.promoteStudent = async (req, res, next) => {
    try {
        const student = await prisma.student.update({
            where: { id: req.params.id },
            data: { currentSemesterId: req.body.nextSemesterId }
        });
        res.status(200).json({ success: true, data: student });
    } catch (error) { next(error); }
};

exports.markPassout = async (req, res, next) => {
    try {
        const student = await prisma.student.update({
            where: { id: req.params.id },
            data: { isPassout: true }
        });
        res.status(200).json({ success: true, data: student });
    } catch (error) { next(error); }
};

exports.getMe = async (req, res, next) => {
    try {
        const student = await prisma.student.findFirst({
            where: { userId: req.user.id },
            include: {
                department: { select: { id: true, name: true, code: true } },
                course: { select: { id: true, name: true } },
                currentSemester: { select: { id: true, name: true, level: true } },
                section: { select: { id: true, name: true } }
            }
        });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        res.status(200).json({ success: true, data: student });
    } catch (error) { next(error); }
};

exports.deleteStudent = async (req, res, next) => {
    try {
        const student = await prisma.student.findUnique({ where: { id: req.params.id } });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        await prisma.student.delete({ where: { id: student.id } });
        await prisma.user.delete({ where: { id: student.userId } });

        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) { next(error); }
};

exports.updateStudent = async (req, res, next) => {
    try {
        const { name, email, password, universityRollNo, phone, admissionDate, departmentId, courseId, currentSemesterId, sectionId, fundingType } = req.body;
        const hasUniversityRollNo = Object.prototype.hasOwnProperty.call(req.body, 'universityRollNo');
        const normalizedUniversityRollNo = hasUniversityRollNo
            ? (typeof universityRollNo === 'string' ? universityRollNo.trim() : universityRollNo) || null
            : undefined;
        
        // Check if university roll number already exists (if being updated)
        if (normalizedUniversityRollNo) {
            const existingStudent = await prisma.student.findFirst({ 
                where: { 
                    universityRollNo: normalizedUniversityRollNo,
                    id: { not: req.params.id }
                } 
            });
            if (existingStudent) {
                return res.status(400).json({ success: false, message: 'University roll number already exists' });
            }
        }
        
        // Get current student to preserve userId
        const currentStudent = await prisma.student.findUnique({
            where: { id: req.params.id },
            include: { user: true }
        });
        
        if (!currentStudent) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        
        const studentUpdateData = { 
            name,
            phone,
            admissionDate: admissionDate ? new Date(admissionDate) : null,
            departmentId,
            courseId,
            currentSemesterId,
            sectionId,
            fundingType
        };

        if (hasUniversityRollNo) {
            studentUpdateData.universityRollNo = normalizedUniversityRollNo;
        }

        // Update student
        const student = await prisma.student.update({
            where: { id: req.params.id },
            data: studentUpdateData,
            include: {
                user: { select: { email: true } },
                department: { select: { name: true, code: true } },
                course: { select: { name: true } },
                currentSemester: { select: { name: true } },
                section: { select: { name: true } }
            }
        });

        // Update user if email or password provided
        if (email || password) {
            const updateData = {};
            if (email) {
                // Check if email already exists for another user
                const emailExists = await prisma.user.findFirst({
                    where: {
                        email,
                        id: { not: currentStudent.userId }
                    }
                });
                if (emailExists) {
                    return res.status(400).json({ success: false, message: 'Email already exists' });
                }
                updateData.email = email;
            }
            if (password) updateData.password = await bcrypt.hash(password, 10);
            
            await prisma.user.update({
                where: { id: currentStudent.userId },
                data: updateData
            });
        }

        res.status(200).json({ success: true, data: student, message: 'Student updated successfully' });
    } catch (error) {
        console.error('Update student error:', error);
        next(error);
    }
};
