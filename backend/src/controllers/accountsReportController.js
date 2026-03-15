const prisma = require('../config/prisma');

const getDateMatchInfo = (fromDate, toDate) => {
    const obj = {};
    if (fromDate) obj.gte = new Date(fromDate);
    if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        obj.lte = end;
    }
    return obj;
};

exports.getDashboardMetrics = async (req, res, next) => {
    try {
        const { fromDate, toDate } = req.query;

        const feeAgg = await prisma.studentFee.aggregate({
            _sum: { totalPayable: true, remainingBalance: true }
        });
        const metrics = {
            totalRevenue: feeAgg._sum.totalPayable || 0,
            totalPending: feeAgg._sum.remainingBalance || 0
        };

        const paymentDateFilter = getDateMatchInfo(fromDate, toDate);
        const pWhere = { isReversed: false, status: 'SUCCESS' };
        if (Object.keys(paymentDateFilter).length > 0) pWhere.paymentDate = paymentDateFilter;

        const collectionAggs = await prisma.payment.groupBy({
            by: ['paymentSource'],
            where: pWhere,
            _sum: { amountPaid: true }
        });

        metrics.selfCollection = 0;
        metrics.drccCollection = 0;
        metrics.scholarshipCollection = 0;

        collectionAggs.forEach(agg => {
            if (agg.paymentSource === 'SELF') metrics.selfCollection = agg._sum.amountPaid || 0;
            if (agg.paymentSource === 'DRCC') metrics.drccCollection = agg._sum.amountPaid || 0;
            if (agg.paymentSource === 'SCHOLARSHIP') metrics.scholarshipCollection = agg._sum.amountPaid || 0;
        });

        metrics.totalCollected = metrics.selfCollection + metrics.drccCollection + metrics.scholarshipCollection;

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const todayAgg = await prisma.payment.aggregate({
            where: {
                paymentDate: { gte: startOfToday, lte: endOfToday },
                isReversed: false,
                status: 'SUCCESS'
            },
            _sum: { amountPaid: true }
        });

        metrics.todayCollection = todayAgg._sum.amountPaid || 0;

        res.status(200).json({ success: true, data: metrics });
    } catch (error) { next(error); }
};

exports.getStudentWiseFeeStatus = async (req, res, next) => {
    try {
        const statuses = await prisma.studentFee.findMany({
            include: {
                student: { include: { course: true } }, // simple generic fetch since we need course name later
                feeStructure: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, count: statuses.length, data: statuses });
    } catch (err) { next(err); }
};

exports.getSourceWiseCollection = async (req, res, next) => {
    try {
        const { fromDate, toDate } = req.query;
        const pWhere = { isReversed: false, status: 'SUCCESS' };
        const paymentDateFilter = getDateMatchInfo(fromDate, toDate);
        if (Object.keys(paymentDateFilter).length > 0) pWhere.paymentDate = paymentDateFilter;

        const sourceStats = await prisma.payment.groupBy({
            by: ['paymentSource'],
            where: pWhere,
            _sum: { amountPaid: true },
            _count: { id: true }
        });

        const formatted = sourceStats.map(s => ({
            _id: s.paymentSource,
            totalAmount: s._sum.amountPaid || 0,
            transactionCount: s._count.id
        }));

        res.status(200).json({ success: true, data: formatted });
    } catch (err) { next(err); }
};

exports.getCourseWiseCollection = async (req, res, next) => {
    try {
        const { fromDate, toDate } = req.query;
        const pWhere = { isReversed: false, status: 'SUCCESS' };
        const paymentDateFilter = getDateMatchInfo(fromDate, toDate);
        if (Object.keys(paymentDateFilter).length > 0) pWhere.paymentDate = paymentDateFilter;

        const payments = await prisma.payment.findMany({
            where: pWhere,
            include: { student: { include: { course: true } } }
        });

        const courseMap = {};
        payments.forEach(p => {
            if (p.student && p.student.course) {
                const cName = p.student.course.name;
                if (!courseMap[cName]) courseMap[cName] = { amount: 0, count: 0 };
                courseMap[cName].amount += (p.amountPaid || 0);
                courseMap[cName].count += 1;
            }
        });

        const formatted = Object.keys(courseMap).map(k => ({
            _id: k,
            totalAmount: courseMap[k].amount,
            transactionCount: courseMap[k].count
        })).sort((a,b) => b.totalAmount - a.totalAmount);

        res.status(200).json({ success: true, data: formatted });
    } catch (err) { next(err); }
};

exports.getDefaulters = async (req, res, next) => {
    try {
        const defaulters = await prisma.studentFee.findMany({
            where: {
                remainingBalance: { gt: 0 },
                feeStructure: {
                    dueDate: { lt: new Date() }
                }
            },
            include: {
                student: { include: { course: true, currentSemester: true } },
                feeStructure: true
            }
        });

        res.status(200).json({ success: true, count: defaulters.length, data: defaulters });
    } catch (err) { next(err); }
};
