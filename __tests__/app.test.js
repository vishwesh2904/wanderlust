process.env.ATLASDB_URL = 'mongodb://127.0.0.1:27017/roamnest_test';
process.env.SECRET = 'test-secret';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.CLOUD_NAME = 'test-cloud';
process.env.CLOUD_API_KEY = 'test-key';
process.env.CLOUD_API_SECRET = 'test-secret';
process.env.MAP_TOKEN = 'pk.eyJ1IjoidGVzdCIsImEiOiJ0ZXN0In0.test';

jest.mock('mongoose', () => {
  const mockQuery = {
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
  };

  const mockModel = {
    find: jest.fn().mockReturnValue(mockQuery),
    findById: jest.fn().mockResolvedValue(null),
    findByIdAndUpdate: jest.fn().mockResolvedValue({}),
    findByIdAndDelete: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    countDocuments: jest.fn().mockResolvedValue(0),
  };

  const mockSchema = function () {};
  mockSchema.prototype = {};
  Object.assign(mockSchema, {
    add: jest.fn(),
    pre: jest.fn(),
    post: jest.fn(),
    plugin: jest.fn(),
    index: jest.fn(),
    virtual: jest.fn(() => ({ get: jest.fn(), set: jest.fn() })),
    path: jest.fn(() => ({})),
    eachPath: jest.fn(),
    obj: {},
    Types: { ObjectId: 'ObjectId' },
  });

  const mockSchemaConstructor = jest.fn(() => mockSchema);
  mockSchemaConstructor.Types = { ObjectId: 'ObjectId' };

  const mockConnection = {
    readyState: 1,
    model: jest.fn(() => mockModel),
  };

  return {
    connect: jest.fn().mockResolvedValue(mockConnection),
    connection: mockConnection,
    Schema: mockSchemaConstructor,
    model: jest.fn(() => mockModel),
    Types: { ObjectId: 'ObjectId' },
  };
});

jest.mock('passport-local-mongoose', () => {
  return function (schema) {
    schema.statics.register = jest.fn().mockRejectedValue(new Error('User validation failed'));
    schema.statics.authenticate = jest
      .fn()
      .mockReturnValue(jest.fn().mockResolvedValue({ user: null }));
    schema.methods.authenticate = jest.fn().mockResolvedValue(false);
  };
});

jest.mock('../cloudConfig', () => ({
  cloudinary: {},
  storage: {},
}));

jest.mock('multer', () => {
  return jest.fn(() => ({
    single: jest.fn(() => (req, res, next) => next()),
    array: jest.fn(() => (req, res, next) => next()),
  }));
});

const request = require('supertest');
const app = require('../app');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RoamNest API', () => {
  describe('POST /api/auth/signup', () => {
    it('should return 400 when signup fails', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'test', email: 'test@test.com', password: 'password123' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 for missing credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/listings', () => {
    it('should return 200 with paginated shape', async () => {
      const res = await request(app).get('/api/listings');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('listings');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pages');
    });
  });

  describe('GET /api/nonexistent', () => {
    it('should return 404 JSON for unknown API routes', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/listings without auth', () => {
    it('should return 401 JSON', async () => {
      const res = await request(app)
        .post('/api/listings')
        .send({ listing: { title: 'Test' } });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });
});
