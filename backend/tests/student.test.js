const request = require("supertest");
const app = require("../src/app");

// Mock auth middleware to bypass authentication in tests
jest.mock('../src/middlewares/auth', () => ({
    protect: jest.fn((req, res, next) => {
        // Set a mock user on the request
        req.user = {
            id: 'test-user-id',
            role: 'SUPER_ADMIN'
        };
        next();
    }),
    authorize: (...roles) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized - User not authenticated'
                });
            }
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Role '${req.user.role}' is not authorized to access this route`
                });
            }
            next();
        };
    },
    catchAsync: jest.fn((fn) => (req, res, next) => fn(req, res, next).catch(next))
}));

// Mock Prisma student model
jest.mock('../src/config/prisma', () => ({
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    student: {
        findMany: jest.fn().mockResolvedValue([
            { id: 1, name: 'John Doe', email: 'john@example.com', rollNumber: 'STU001' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', rollNumber: 'STU002' }
        ]),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
    },
    section: {
        findMany: jest.fn(),
    },
}));

describe("Student API", () => {
    
    describe("GET /api/v1/students", () => {
        it("should return all students with proper auth", async () => {
            const res = await request(app).get("/api/v1/students");
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('data');
        });
    });
});

