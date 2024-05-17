const authenticate = require('../../middleware/authenticate');
const { generateToken, verifyToken } = require('../../helper/jwt');

jest.mock('../../helper/jwt', () => ({
  ...jest.requireActual('../../helper/jwt'),
  verifyToken: jest.fn(),
}));

describe('authenticate middleware', () => {
  let token;
  const payload = {
    id: 1,
    email: "test@mail.com",
    password: "test"
  };

  beforeAll(() => {
    token = generateToken(payload);
  });

  const mockReq = (headers) => ({
    headers,
  });

  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = jest.fn();

  it('should return 401 if no authorization header is present', () => {
    const req = mockReq({});
    const res = mockRes();

    authenticate(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      code: 401,
      data: null,
      message: 'No token provided'
    });
  });

  it('should return 401 if token is missing in authorization header', () => {
    const req = mockReq({ authorization: 'Bearer ' });
    const res = mockRes();

    authenticate(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      code: 401,
      data: null,
      message: 'No token provided'
    });
  });

  it('should return 401 if token is invalid', () => {
    verifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const req = mockReq({ authorization: 'Bearer invalidtoken' });
    const res = mockRes();

    authenticate(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      code: 401,
      data: null,
      message: 'Failed to authenticate token'
    });
  });

  it('should call next if token is valid', () => {
    verifyToken.mockImplementation(() => payload);

    const req = mockReq({ authorization: `Bearer ${token}` });
    const res = mockRes();

    authenticate(req, res, mockNext);

    expect(verifyToken).toHaveBeenCalledWith(token);
    expect(req.user).toEqual(payload);
    expect(mockNext).toHaveBeenCalled();
  });
});
