require('dotenv').config({ path: __dirname + '/../.env' });
const prisma = require('./config/prisma');
const app = require('./app');

const PORT = process.env.PORT || 5001;

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.error('Please create a .env file with the following variables:');
    console.error('  PORT=5000');
    console.error('  DATABASE_URL="postgresql://root:rootpassword@localhost:5432/college_erp?schema=public"');
    console.error('  JWT_SECRET=your-secret-key');
    process.exit(1);
}

// Connect to PostgreSQL via Prisma
prisma.$connect()
    .then(() => {
        console.log('✓ Successfully connected to PostgreSQL via Prisma');
        
        app.listen(PORT, () => {
            console.log(`✓ Server is running on port ${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`✓ API Base URL: http://localhost:${PORT}/api/v1`);
        });
    })
    .catch((err) => {
        console.error('✗ Prisma connection error:', err.message);
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', async (err) => {
    console.error('✗ Unhandled Rejection:', err.message);
    // Close server & exit process
    await prisma.$disconnect();
    process.exit(1);
});

