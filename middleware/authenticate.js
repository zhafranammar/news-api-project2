const { verifyToken } = require('../helper/jwt');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      code: 401,
      data: null,
      message: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      data: null,
      message: 'No token provided'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      data: null,
      message: 'Failed to authenticate token'
    });
  }
};

module.exports = authenticate;
