const request = require('supertest');
const app = require('../../src/app');
const { TOKENS } = require('./setup');

describe('Marks API', () => {
  test('GET /api/v1/marks should reject unauthenticated request', async () => {
    await request(app)
      .get('/api/v1/marks')
      .expect(401);
  });

  test('GET /api/v1/marks should allow authenticated request', async () => {
    await request(app)
      .get('/api/v1/marks')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .expect((res) => {
        expect([200, 500]).toContain(res.status);
      });
  });

  test('POST /api/v1/marks should reject student role', async () => {
    await request(app)
      .post('/api/v1/marks')
      .set('Authorization', `Bearer ${TOKENS.STUDENT}`)
      .send({})
      .expect(403);
  });

  test('POST /api/v1/marks should allow faculty role through auth layer', async () => {
    await request(app)
      .post('/api/v1/marks')
      .set('Authorization', `Bearer ${TOKENS.FACULTY}`)
      .send({
        examType: 'SESSIONAL',
        session: 'test-session-id',
        subject: 'test-subject-id',
        section: 'test-section-id',
        records: [{ student: 'test-student-id', marksObtained: 25 }],
        maxMarks: 30
      })
      .expect((res) => {
        expect([200, 400, 500]).toContain(res.status);
      });
  });

  test('PATCH /api/v1/marks/:id/lock should reject faculty role', async () => {
    await request(app)
      .patch('/api/v1/marks/test-mark-id/lock')
      .set('Authorization', `Bearer ${TOKENS.FACULTY}`)
      .expect(403);
  });

  test('PATCH /api/v1/marks/:id/lock should allow admin role through auth layer', async () => {
    await request(app)
      .patch('/api/v1/marks/test-mark-id/lock')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .expect((res) => {
        expect([200, 500]).toContain(res.status);
      });
  });

  test('GET /api/v1/marks/teacher/classes should reject non-faculty role', async () => {
    await request(app)
      .get('/api/v1/marks/teacher/classes')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .expect(403);
  });

  test('GET /api/v1/marks/teacher/classes should allow faculty role through auth layer', async () => {
    await request(app)
      .get('/api/v1/marks/teacher/classes')
      .set('Authorization', `Bearer ${TOKENS.FACULTY}`)
      .expect((res) => {
        expect([200, 404, 500]).toContain(res.status);
      });
  });
});
