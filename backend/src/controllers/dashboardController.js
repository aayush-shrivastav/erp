const prisma = require('../config/prisma');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalStudents = await prisma.student.count();
        const totalFaculty = await prisma.faculty.count();
        const totalDepartments = await prisma.department.count();
        const totalClasses = await prisma.section.count();
        const activeSession = await prisma.academicSession.findFirst({ where: { isActive: true } });

        const feesResult = await prisma.fee.aggregate({
            where: { status: { not: 'PAID' } },
            _sum: {
                totalAmount: true,
                paidAmount: true
            }
        });

        const totalPendingFees = (feesResult._sum.totalAmount || 0) - (feesResult._sum.paidAmount || 0);

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalFaculty,
                totalDepartments,
                totalClasses,
                activeSession: activeSession ? activeSession.year : 'No Active Session',
                totalPendingFees
            }
        });
    } catch (error) { next(error); }
};
