import request from 'supertest';
import app from '../app.js'; 

describe('User Registration', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: 'testuser@example.com',
        password: 'Password123!',
        role: 'agent',
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('email', 'testuser@example.com');
  });
});
