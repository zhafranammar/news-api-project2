const request = require('supertest');
const app = require('../')
const { User, New } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

jest.mock('../models'); // Mock the models to avoid actual database operations

describe('API Integration Tests', () => {
  let server;

  beforeAll(() => {
    server = app.listen(4000); // Start the server on a different port for testing
  });

  afterAll(async () => {
    await server.close(); // Close the server after tests
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
      };

      User.create.mockResolvedValue(mockUser);

      const res = await request(server)
        .post('/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        code: 200,
        data: {
          user: mockUser
        },
        message: 'User registered successfully',
      });
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(server)
        .post('/register')
        .send({
          email: 'test@example.com',
        });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        code: 400,
        data: null,
        message: 'Required fields are missing',
      });
    });

    it('should return 500 if there is a server error', async () => {
      User.create.mockRejectedValue(new Error('Server error'));

      const res = await request(server)
        .post('/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        code: 500,
        data: null,
        message: 'Internal server error',
      });
    });
  });

  describe('User Login', () => {
    let token;

    it('should login a user successfully and return a token', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10), // bcrypt hashed password
      };

      token = jwt.sign({ userId: mockUser.id }, 'secret', { expiresIn: '1h' });

      User.findOne.mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue(token);

      const res = await request(server)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        code: 200,
        data: { token },
        message: 'Login successful',
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10), // bcrypt hashed password
      };

      User.findOne.mockResolvedValue(mockUser);

      const res = await request(server)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        code: 401,
        data: null,
        message: 'Invalid email or password',
      });
    });

    it('should return 500 if there is a server error', async () => {
      User.findOne.mockRejectedValue(new Error('Server error'));

      const res = await request(server)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        code: 500,
        data: null,
        message: 'Internal server error',
      });
    });
  });

  describe('Authenticated News API', () => {
    let token;

    beforeAll(async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10), // bcrypt hashed password
      };

      User.findOne.mockResolvedValue(mockUser);
      token = jwt.sign({ userId: mockUser.id }, 'secret', { expiresIn: '1h' });
    });

    it('should create a new news successfully', async () => {
      const mockNews = {
        id: 1,
        title: 'New 1',
        content: 'Content of New 1',
        publicationDate: '2024-05-16T16:46:46.894Z',
      };

      New.create.mockResolvedValue(mockNews);

      const res = await request(server)
        .post('/news')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New 1',
          userId: 1,
          content: 'Content of New 1',
        });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        code: 201,
        data: mockNews,
        message: 'News created successfully',
      });
    });

    it('should retrieve news by author successfully', async () => {
      const mockNews = [
        { id: 1, title: 'News 1', userId: 1, content: 'Content of News 1' },
        { id: 2, title: 'News 2', userId: 1, content: 'Content of News 2' },
      ];

      New.findAll.mockResolvedValue(mockNews);

      const res = await request(server)
        .get('/news/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        code: 200,
        data: mockNews,
        message: 'News retrieved successfully',
      });
    });

    it('should delete the news successfully', async () => {
      const mockNews = {
        id: 1,
        userId: 1,
        destroy: jest.fn().mockResolvedValue(),
      };

      New.findByPk.mockResolvedValue(mockNews);

      const res = await request(server)
        .delete('/news/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        code: 200,
        data: null,
        message: 'News deleted successfully',
      });
    });
  });
});
