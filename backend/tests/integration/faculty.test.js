const request = require('supertest');
const app = require('../../src/app');
const { TOKENS } = require('./setup');

describe('Faculty API', () => {
  test('GET /api/v1/faculty should reject unauthenticated request', async () => {
    await request(app)
      .get('/api/v1/faculty')
      .expect(401);
  });

  test('GET /api/v1/faculty should allow authenticated request', async () => {
    await request(app)
      .get('/api/v1/faculty')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .expect((res) => {
        expect([200, 500]).toContain(res.status);
      });
  });

  test('POST /api/v1/faculty should reject faculty role', async () => {
    await request(app)
      .post('/api/v1/faculty')
      .set('Authorization', `Bearer ${TOKENS.FACULTY}`)
      .send({})
      .expect(403);
  });

  test('POST /api/v1/faculty should allow admin role through auth layer', async () => {
    await request(app)
      .post('/api/v1/faculty')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .send({
        email: 'newfaculty@test.com',
        password: 'TestPass123',
        employeeId: 'NEW-FAC-001',
        name: 'New Test Faculty'
      })
      .expect((res) => {
        expect([201, 400, 404, 500]).toContain(res.status);
      });
  });

  test('GET /api/v1/faculty/me should reject non-faculty role', async () => {
    await request(app)
      .get('/api/v1/faculty/me')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .expect(403);
  });

  test('GET /api/v1/faculty/me should allow faculty role through auth layer', async () => {
    await request(app)
      .get('/api/v1/faculty/me')
      .set('Authorization', `Bearer ${TOKENS.FACULTY}`)
      .expect((res) => {
        expect([200, 404, 500]).toContain(res.status);
      });
  });
});
