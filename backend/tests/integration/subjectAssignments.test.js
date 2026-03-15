const request = require('supertest');
const app = require('../../src/app');
const { TOKENS } = require('./setup');

describe('Subject Assignments API', () => {
  test('GET /api/v1/subject-assignments should reject unauthenticated request', async () => {
    await request(app)
      .get('/api/v1/subject-assignments')
      .expect(401);
  });

  test('GET /api/v1/subject-assignments should reject faculty role', async () => {
    await request(app)
      .get('/api/v1/subject-assignments')
      .set('Authorization', `Bearer ${TOKENS.FACULTY}`)
      .expect(403);
  });

  test('GET /api/v1/subject-assignments should allow admin role through auth layer', async () => {
    await request(app)
      .get('/api/v1/subject-assignments')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .expect((res) => {
        expect([200, 500]).toContain(res.status);
      });
  });

  test('POST /api/v1/subject-assignments should allow admin role through auth layer', async () => {
    await request(app)
      .post('/api/v1/subject-assignments')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .send({
        faculty: 'test-faculty-id',
        subject: 'test-subject-id',
        section: 'test-section-id'
      })
      .expect((res) => {
        expect([201, 400, 404, 422, 500]).toContain(res.status);
      });
  });
});
