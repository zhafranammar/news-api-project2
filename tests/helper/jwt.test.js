const { generateToken, verifyToken } = require('../../helper/jwt')
const jwt = require('jsonwebtoken')

describe('jwt', () => {
  let token;
  const payload = {
    id: 1,
    email: "test@mail.com",
    password: "test"
  }

  beforeAll(() => {
    token = generateToken(payload)
  })

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      expect(typeof token).toBe('string');
      const decoded = jwt.decode(token);
      expect(decoded).toMatchObject({ id: payload.id, email: payload.email });
    });

    it('should include the expiration in the token', () => {
      const decoded = jwt.decode(token);
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return the payload', () => {
      const verified = verifyToken(token);
      expect(verified).toMatchObject({ id: payload.id, email: payload.email, password: payload.password });
    });

    it('should throw an error for an invalid token', () => {
      const invalidToken = token + 'invalid';
      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw an error for an expired token', (done) => {
      const shortLivedToken = jwt.sign(payload, 'secret', { expiresIn: '1ms' });
      setTimeout(() => {
        expect(() => verifyToken(shortLivedToken)).toThrow(jwt.TokenExpiredError);
        done();
      }, 10);
    });
  });
})