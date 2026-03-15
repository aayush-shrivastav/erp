const jwt = require('jsonwebtoken');

// Static credentials used by tests that still post to /auth/login.
const TEST_ADMIN = { email: 'testadmin@test.com', password: 'TestPass123' };
const TEST_FACULTY = { email: 'testfaculty@test.com', password: 'TestPass123' };
const TEST_STUDENT = { email: 'teststudent@test.com', password: 'TestPass123' };

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';

const buildToken = (id, role) => jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1h' });

const TOKENS = {
  ADMIN: buildToken('test-admin-id', 'SUPER_ADMIN'),
  FACULTY: buildToken('test-faculty-id', 'FACULTY'),
  STUDENT: buildToken('test-student-id', 'STUDENT')
};

module.exports = {
  TEST_ADMIN,
  TEST_FACULTY,
  TEST_STUDENT,
  TOKENS
};

