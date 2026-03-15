const request = require('supertest');
const app = require('../../src/app');
const { TOKENS } = require('./setup');

describe('Groups API', () => {
  test('GET /api/v1/groups should reject unauthenticated request', async () => {
    await request(app)
      .get('/api/v1/groups')
      .expect(401);
  });

  test('GET /api/v1/groups should reject student role', async () => {
    await request(app)
      .get('/api/v1/groups')
      .set('Authorization', `Bearer ${TOKENS.STUDENT}`)
      .expect(403);
  });

  test('GET /api/v1/groups should allow admin role through auth layer', async () => {
    await request(app)
      .get('/api/v1/groups')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .expect((res) => {
        expect([200, 500]).toContain(res.status);
      });
  });

  test('POST /api/v1/groups should allow admin role through auth layer', async () => {
    await request(app)
      .post('/api/v1/groups')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .send({
        name: 'TEST-GROUP-001',
        semesterId: 'test-semester-id',
        departmentId: 'test-dept-id',
        section: 'A'
      })
      .expect((res) => {
        expect([201, 400, 404, 422, 500]).toContain(res.status);
      });
  });

  test('GET /api/v1/groups/:id/students should allow admin role through auth layer', async () => {
    await request(app)
      .get('/api/v1/groups/test-group-id/students')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .expect((res) => {
        expect([200, 404, 500]).toContain(res.status);
      });
  });
});
