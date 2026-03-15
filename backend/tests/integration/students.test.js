const request = require('supertest');
const app = require('../../src/app');
const { TOKENS } = require('./setup');

describe('Students API', () => {
  test('GET /api/v1/students should reject unauthenticated request', async () => {
    await request(app)
      .get('/api/v1/students')
      .expect(401);
  });

  test('GET /api/v1/students should reject student role', async () => {
    await request(app)
      .get('/api/v1/students')
      .set('Authorization', `Bearer ${TOKENS.STUDENT}`)
      .expect(403);
  });

  test('GET /api/v1/students should allow admin role', async () => {
    await request(app)
      .get('/api/v1/students')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .expect((res) => {
        expect([200, 500]).toContain(res.status);
      });
  });

  test('POST /api/v1/students should reject faculty role', async () => {
    await request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer ${TOKENS.FACULTY}`)
      .send({})
      .expect(403);
  });

  test('POST /api/v1/students should allow admin role through auth layer', async () => {
    await request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .send({
        email: 'newtest@test.com',
        password: 'TestPass123',
        enrollmentNo: 'NEW001',
        name: 'New Test Student',
        departmentId: 'test-dept-id',
        courseId: 'test-course-id',
        currentSemesterId: 'test-sem-id',
        sectionId: 'test-section-id'
      })
      .expect((res) => {
        expect([201, 400, 404, 500]).toContain(res.status);
      });
  });

  test('PUT /api/v1/students/:id should allow admin role through auth layer', async () => {
    await request(app)
      .put('/api/v1/students/test-student-id')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .send({ name: 'Updated Student' })
      .expect((res) => {
        expect([200, 400, 404, 500]).toContain(res.status);
      });
  });

  test('DELETE /api/v1/students/:id should reject student role', async () => {
    await request(app)
      .delete('/api/v1/students/test-id')
      .set('Authorization', `Bearer ${TOKENS.STUDENT}`)
      .expect(403);
  });
});
