process.env.ATLASDB_URL = 'mongodb://127.0.0.1:27017/roamnest_test';
process.env.SECRET = 'test-secret';
process.env.CLOUD_NAME = 'test-cloud';
process.env.CLOUD_API_KEY = 'test-key';
process.env.CLOUD_API_SECRET = 'test-secret';
process.env.MAP_TOKEN = 'pk.eyJ1IjoidGVzdCIsImEiOiJ0ZXN0In0.test';

// Mock mongoose.connect to avoid needing a real DB for tests
const mongoose = require('mongoose');
const originalConnect = mongoose.connect;
mongoose.connect = async () => {
  console.log('Mocked DB connection');
};

const request = require('supertest');
const app = require('../app');

describe('RoamNest App', () => {
  describe('GET /login', () => {
    it('should return 200 for login page', async () => {
      const res = await request(app).get('/login');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /signup', () => {
    it('should return 200 for signup page', async () => {
      const res = await request(app).get('/signup');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/nonexistent-route');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /listings without auth', () => {
    it('should redirect to login', async () => {
      const res = await request(app)
        .post('/listings')
        .send({ listing: { title: 'Test' } });
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toMatch(/\/login/);
    });
  });
});
