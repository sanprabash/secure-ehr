const request = require('supertest');
const express = require('express');

// Mock app for testing
const app = express();
app.use(express.json());

//  MOCK ROUTES FOR TESTING 
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  if (email === 'test@mail.com' && password === 'test1234') {
    return res.status(200).json({
      token: 'mock-jwt-token',
      user: { role: 'patient', firstName: 'Test', lastName: 'User' }
    });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }
  return res.status(201).json({ message: 'User registered successfully' });
});

app.get('/api/patient/records', (req, res) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }
  return res.status(200).json([]);
});

app.get('/api/patient/stats', (req, res) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }
  return res.status(200).json({
    totalRecords: 0,
    doctorsWithAccess: 0,
    lastUpload: 'No records yet'
  });
});

app.get('/api/doctor/patients', (req, res) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }
  return res.status(200).json([]);
});

app.post('/api/patient/consents', (req, res) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }
  const { slmcNumber } = req.body;
  if (!slmcNumber) {
    return res.status(400).json({ message: 'SLMC number required' });
  }
  return res.status(200).json({ message: 'Consent granted' });
});

app.get('/api/notifications', (req, res) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }
  return res.status(200).json([]);
});

app.get('/api/notifications/unread-count', (req, res) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }
  return res.status(200).json({ count: 0 });
});

//  TESTS 

describe('Authentication API', () => {
  test('POST /api/auth/login — success with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@mail.com', password: 'test1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('patient');
  });

  test('POST /api/auth/login — fails with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@mail.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('POST /api/auth/login — fails with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@mail.com' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/auth/register — success with all fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@mail.com',
        password: 'password123'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  test('POST /api/auth/register — fails with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'john@mail.com' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Patient API', () => {
  test('GET /api/patient/records — fails without token', async () => {
    const res = await request(app).get('/api/patient/records');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/patient/records — success with token', async () => {
    const res = await request(app)
      .get('/api/patient/records')
      .set('Authorization', 'Bearer mock-jwt-token');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/patient/stats — fails without token', async () => {
    const res = await request(app).get('/api/patient/stats');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/patient/stats — success with token', async () => {
    const res = await request(app)
      .get('/api/patient/stats')
      .set('Authorization', 'Bearer mock-jwt-token');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalRecords');
    expect(res.body).toHaveProperty('doctorsWithAccess');
  });

  test('POST /api/patient/consents — fails without token', async () => {
    const res = await request(app)
      .post('/api/patient/consents')
      .send({ slmcNumber: 'SLMC-12345' });
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/patient/consents — fails without SLMC number', async () => {
    const res = await request(app)
      .post('/api/patient/consents')
      .set('Authorization', 'Bearer mock-jwt-token')
      .send({});
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/patient/consents — success with token and SLMC', async () => {
    const res = await request(app)
      .post('/api/patient/consents')
      .set('Authorization', 'Bearer mock-jwt-token')
      .send({ slmcNumber: 'SLMC-12345' });
    expect(res.statusCode).toBe(200);
  });
});

describe('Doctor API', () => {
  test('GET /api/doctor/patients — fails without token', async () => {
    const res = await request(app).get('/api/doctor/patients');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/doctor/patients — success with token', async () => {
    const res = await request(app)
      .get('/api/doctor/patients')
      .set('Authorization', 'Bearer mock-jwt-token');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Notification API', () => {
  test('GET /api/notifications — fails without token', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/notifications — success with token', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', 'Bearer mock-jwt-token');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/notifications/unread-count — fails without token', async () => {
    const res = await request(app).get('/api/notifications/unread-count');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/notifications/unread-count — success with token', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', 'Bearer mock-jwt-token');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('count');
  });
});