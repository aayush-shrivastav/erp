const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

exports.createAdmin = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        // Only allow creating specific admin roles
        if (!['ACADEMIC_ADMIN', 'ACCOUNTS_ADMIN'].includes(role)) {
            return res.status(400).json({ message: 'Invalid admin role specified' });
        }

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role
            }
        });

        res.status(201).json({
            success: true,
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAdmins = async (req, res, next) => {
    try {
        // Exclude passwords
        const admins = await prisma.user.findMany({
            where: { role: { in: ['ACADEMIC_ADMIN', 'ACCOUNTS_ADMIN', 'SUPER_ADMIN'] } },
            select: { id: true, email: true, role: true, isActive: true, lastLogin: true, createdAt: true, updatedAt: true }
        });
        res.status(200).json({ success: true, count: admins.length, data: admins });
    } catch (error) {
        next(error);
    }
};

exports.updateAdmin = async (req, res, next) => {
    try {
        const { email, password, role, isActive } = req.body;
        const updateData = {};
        if (email) updateData.email = email;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (role) {
            if (!['ACADEMIC_ADMIN', 'ACCOUNTS_ADMIN'].includes(role)) {
                return res.status(400).json({ message: 'Invalid admin role specified' });
            }
            updateData.role = role;
        }
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        const admin = await prisma.user.update({
            where: { id: req.params.id },
            data: updateData,
            select: { id: true, email: true, role: true, isActive: true }
        });
        res.status(200).json({ success: true, data: admin, message: 'Admin updated successfully' });
    } catch (error) { next(error); }
};

exports.deleteAdmin = async (req, res, next) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, message: 'Admin deleted successfully' });
    } catch (error) { next(error); }
};
