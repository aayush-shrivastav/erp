const request = require('supertest');
const app = require('../../src/app');
const { TOKENS } = require('./setup');

describe('Attendance API', () => {
  test('GET /api/v1/attendance should reject unauthenticated request', async () => {
    await request(app)
      .get('/api/v1/attendance')
      .expect(401);
  });

  test('GET /api/v1/attendance should allow faculty role', async () => {
    await request(app)
      .get('/api/v1/attendance')
      .set('Authorization', `Bearer ${TOKENS.FACULTY}`)
      .expect((res) => {
        expect([200, 500]).toContain(res.status);
      });
  });

  test('POST /api/v1/attendance should reject student role', async () => {
    await request(app)
      .post('/api/v1/attendance')
      .set('Authorization', `Bearer ${TOKENS.STUDENT}`)
      .send({})
      .expect(403);
  });

  test('POST /api/v1/attendance should allow faculty role through auth layer', async () => {
    await request(app)
      .post('/api/v1/attendance')
      .set('Authorization', `Bearer ${TOKENS.FACULTY}`)
      .send({
        session: 'test-session-id',
        date: new Date().toISOString(),
        section: 'test-section-id',
        subject: 'test-subject-id',
        records: [{ student: 'test-student-id', status: 'PRESENT' }]
      })
      .expect((res) => {
        expect([200, 400, 500]).toContain(res.status);
      });
  });

  test('GET /api/v1/attendance/my-attendance should reject admin role', async () => {
    await request(app)
      .get('/api/v1/attendance/my-attendance')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .expect(403);
  });

  test('GET /api/v1/attendance/my-attendance should allow student role through auth layer', async () => {
    await request(app)
      .get('/api/v1/attendance/my-attendance')
      .set('Authorization', `Bearer ${TOKENS.STUDENT}`)
      .expect((res) => {
        expect([200, 404, 500]).toContain(res.status);
      });
  });
});
