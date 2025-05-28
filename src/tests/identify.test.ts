import request from 'supertest';
import express from 'express';
import identifyRoutes from '../routes/identify';

const app = express();
app.use(express.json());
app.use('/api', identifyRoutes);

describe('POST /api/identify', () => {
  it('should reject empty body', async () => {
    const res = await request(app).post('/api/identify').send({});
    expect(res.statusCode).toBe(400);
  });

  it('should create new contact', async () => {
    const res = await request(app).post('/api/identify').send({
      email: 'test1@example.com',
      phoneNumber: '9999999999',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.contact).toHaveProperty('primaryContactId');
  });
});