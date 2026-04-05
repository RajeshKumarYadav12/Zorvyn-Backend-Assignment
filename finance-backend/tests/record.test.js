import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Record from '../src/models/record.model.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

let token;
let userId;

beforeAll(async () => {
  await connectDB();
  // Create a test user
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'admin'
  });
  userId = user._id;
  // Mock login to get token (assuming you have a way)
  // For simplicity, generate token here
  const jwt = (await import('jsonwebtoken')).default;
  token = jwt.sign({ id: userId, role: 'admin' }, process.env.JWT_SECRET || 'testsecret');
});

afterAll(async () => {
  await User.deleteMany({});
  await Record.deleteMany({});
  await disconnectDB();
});

describe('Record API', () => {
  it('should create a record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 100,
        type: 'income',
        category: 'Salary'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
  });

  it('should get records', async () => {
    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
  });

  it('should search records', async () => {
    const res = await request(app)
      .get('/api/records?search=Salary')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
  });
});