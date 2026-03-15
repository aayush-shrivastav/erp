require('dotenv').config();
const prisma = require('./src/config/prisma');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    try {
        const adminExists = await prisma.user.findUnique({ where: { email: 'admin@eduerp.com' } });
        if (!adminExists) {
            console.log('Creating initial Super Admin...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await prisma.user.create({
                data: {
                    email: 'admin@eduerp.com',
                    password: hashedPassword,
                    role: 'SUPER_ADMIN'
                }
            });
            console.log('Super Admin seeded successfully!');
        } else {
            console.log('Super Admin already exists. Default credentials: admin@eduerp.com / admin123');
        }
    } catch (err) {
        console.error('Error connecting to DB:', err);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
