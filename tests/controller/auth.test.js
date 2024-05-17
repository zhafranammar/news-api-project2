const { register, login } = require('../../controller/auth');
const { User } = require('../../models');
const bcrypt = require('bcrypt');
const { generateToken } = require('../../helper/jwt');

// Mocking bcrypt functions
jest.mock('bcrypt');
jest.mock('../../helper/jwt');

describe('authController', () => {
  describe('static create', () => {
    let reqRegister, res, next;

    beforeEach(() => {
      reqRegister = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          phone: '1234567890'
        }
      };



      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      next = jest.fn();

      // Mock the User model methods
      User.findOne = jest.fn();
      User.create = jest.fn();
    });

    test('controller has static create', () => {
      expect(typeof register).toBe('function');
    });

    it('static create will call User.create', async () => {
      // Mocking bcrypt.hash function
      bcrypt.hash.mockResolvedValue('hashedPassword');

      // Mocking User.findOne to return null (indicating email is not already in use)
      User.findOne.mockResolvedValue(null);

      // Mocking User.create to return a new user object
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      User.create.mockResolvedValue(mockUser);

      // Calling register function
      await register(reqRegister, res, next);

      // Expecting User.create to have been called with the correct parameters
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        phone: '1234567890',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // Expecting response status to be 201
      expect(res.status).toHaveBeenCalledWith(201);
      // Expecting response json to be called with the success message
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        data: {
          user: mockUser, // Use the mockUser object here
        },
        message: 'User registered successfully'
      });
    });
  });

  describe('Login Function', () => {
    let reqLogin, res, next;

    beforeEach(() => {
      reqLogin = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      next = jest.fn();

      // Mock the User model methods
      User.findOne = jest.fn();
    });

    it('should return 400 if the user does not exist', async () => {
      // Mocking User.findOne to return null (user not found)
      User.findOne.mockResolvedValue(null);

      // Calling login function
      await login(reqLogin, res, next);

      // Expecting response status to be 400
      expect(res.status).toHaveBeenCalledWith(401);
      // Expecting response json to be called with the error message
      expect(res.json).toHaveBeenCalledWith({
        code: 400,
        data: null,
        message: 'Invalid email or password'
      });
    });

    it('should return 400 if the password is incorrect', async () => {
      // Mocking User.findOne to return a user object
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword'
      };
      User.findOne.mockResolvedValue(mockUser);

      // Mocking bcrypt.compare to return false (password is incorrect)
      bcrypt.compare.mockResolvedValue(false);

      // Calling login function
      await login(reqLogin, res, next);

      // Expecting response status to be 400
      expect(res.status).toHaveBeenCalledWith(401);
      // Expecting response json to be called with the error message
      expect(res.json).toHaveBeenCalledWith({
        code: 401,
        data: null,
        message: 'Invalid email or password'
      });
    });

    it('should return 200 and a token if the login is successful', async () => {
      // Mocking User.findOne to return a user object
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword'
      };
      User.findOne.mockResolvedValue(mockUser);

      // Mocking bcrypt.compare to return true (password is correct)
      bcrypt.compare.mockResolvedValue(true);

      // Mocking generateToken to return a token
      const mockToken = 'fakeToken';
      generateToken.mockReturnValue(mockToken);

      // Calling login function
      await login(reqLogin, res, next);

      // Expecting response status to be 200
      expect(res.status).toHaveBeenCalledWith(200);
      // Expecting response json to be called with the token
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        data: { token: mockToken },
        message: 'Login successful'
      });
    });

    it('should return 500 if there is an internal server error', async () => {
      // Mocking User.findOne to throw an error
      User.findOne.mockRejectedValue(new Error('Database error'));

      // Calling login function
      await login(reqLogin, res, next);

      // Expecting response status to be 500
      expect(res.status).toHaveBeenCalledWith(500);
      // Expecting response json to be called with the error message
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        data: null,
        message: 'Internal server error'
      });
    });
  });
});
