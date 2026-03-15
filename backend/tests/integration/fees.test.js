const request = require('supertest');
const app = require('../../src/app');
const { TOKENS } = require('./setup');

describe('Fees & Payments API', () => {
  test('GET /api/v1/fees/my-fees should reject non-student role', async () => {
    await request(app)
      .get('/api/v1/fees/my-fees')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .expect(403);
  });

  test('GET /api/v1/fees/my-fees should allow student role through auth layer', async () => {
    await request(app)
      .get('/api/v1/fees/my-fees')
      .set('Authorization', `Bearer ${TOKENS.STUDENT}`)
      .expect((res) => {
        expect([200, 404, 500]).toContain(res.status);
      });
  });

  test('GET /api/v1/accounts/student-fees/:id should reject unauthenticated request', async () => {
    await request(app)
      .get('/api/v1/accounts/student-fees/test-student-id')
      .expect(401);
  });

  test('GET /api/v1/accounts/student-fees/:id should allow admin role through auth layer', async () => {
    await request(app)
      .get('/api/v1/accounts/student-fees/test-student-id')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .expect((res) => {
        expect([200, 404, 500]).toContain(res.status);
      });
  });

  test('POST /api/v1/fees/:id/payments should reject student role', async () => {
    await request(app)
      .post('/api/v1/fees/test-fee-id/payments')
      .set('Authorization', `Bearer ${TOKENS.STUDENT}`)
      .send({ amount: 1000 })
      .expect(403);
  });

  test('POST /api/v1/fees/:id/payments should allow admin role through auth layer', async () => {
    await request(app)
      .post('/api/v1/fees/test-fee-id/payments')
      .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
      .send({ amount: 5000, mode: 'CASH' })
      .expect((res) => {
        expect([200, 400, 404, 500]).toContain(res.status);
      });
  });
});
