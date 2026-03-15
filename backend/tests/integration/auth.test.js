const request = require('supertest');
const app = require('../../src/app');
const { TEST_ADMIN } = require('./setup');

describe('Authentication API', () => {
  test('POST /api/v1/auth/login - should reject unknown mocked user credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: TEST_ADMIN.email,
        password: 'TestPass123'
      })
      .expect(401);

    expect(response.body.message).toMatch(/invalid credentials|inactive account/i);
  });

  test('POST /api/v1/auth/login - should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'invalid@test.com',
        password: 'wrong'
      })
      .expect(401);

    expect(response.body.message).toMatch(/invalid credentials/i);
  });

  test('POST /api/v1/auth/login - should return 400 for missing email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: 'test' })
      .expect(400);

    expect(response.body.message).toMatch(/email.*password/i);
  });
});

