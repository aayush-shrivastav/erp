// Jest setup file - runs before each test file

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5433/test_db';

// Mock Prisma client to prevent actual database connections
jest.mock('../src/config/prisma', () => ({
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    student: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    section: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
    },
    subject: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
    },
    academicYear: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
    },
    // Add other models as needed
}));

