const prisma = require('../config/prisma');

exports.createNotice = async (req, res, next) => {
    try {
        const noticeData = {
            ...req.body,
            createdById: req.user.id
        };
        const notice = await prisma.notice.create({ data: noticeData });
        res.status(201).json({ success: true, data: notice });
    } catch (error) { next(error); }
};

exports.getNotices = async (req, res, next) => {
    try {
        const where = {};
        if (req.query.targetAudience) where.targetAudience = req.query.targetAudience;

        const notices = await prisma.notice.findMany({
            where,
            include: {
                createdBy: { select: { email: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, count: notices.length, data: notices });
    } catch (error) { next(error); }
};

exports.updateNotice = async (req, res, next) => {
    try {
        const notice = await prisma.notice.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.status(200).json({ success: true, data: notice });
    } catch (error) { next(error); }
};

exports.deleteNotice = async (req, res, next) => {
    try {
        await prisma.notice.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, message: 'Notice deleted successfully' });
    } catch (error) { next(error); }
};
