const prisma = require('../config/prisma');

exports.getSettings = async (req, res, next) => {
    try {
        let setting = await prisma.setting.findFirst();
        if (!setting) {
            setting = await prisma.setting.create({ data: {} });
        }
        res.status(200).json({ success: true, data: setting });
    } catch (error) { next(error); }
};

exports.updateSettings = async (req, res, next) => {
    try {
        let setting = await prisma.setting.findFirst();
        if (!setting) {
            setting = await prisma.setting.create({ data: req.body });
        } else {
            setting = await prisma.setting.update({
                where: { id: setting.id },
                data: req.body
            });
        }
        res.status(200).json({ success: true, data: setting });
    } catch (error) { next(error); }
};
