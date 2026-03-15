const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid credentials or inactive account' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        // Fetch name from linked profile (student or faculty)
        let name = null;
        if (user.role === 'STUDENT') {
            const student = await prisma.student.findUnique({ where: { userId: user.id }, select: { name: true } });
            name = student?.name || null;
        } else if (user.role === 'FACULTY') {
            const faculty = await prisma.faculty.findUnique({ where: { userId: user.id }, select: { name: true } });
            name = faculty?.name || null;
        }

        res.status(200).json({
            success: true,
            token: generateToken(user.id, user.role),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: name || user.email.split('@')[0],
            }
        });
    } catch (error) {
        next(error);
    }
};
