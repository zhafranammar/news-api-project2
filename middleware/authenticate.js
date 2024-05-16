const { verifyToken } = require('../helper/jwt');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Authorization Header:', authHeader);

  if (!authHeader) {
    return res.status(401).json({
      code: 401,
      data: null,
      message: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted Token:', token);

  if (!token) {
    return res.status(401).json({
      code: 401,
      data: null,
      message: 'No token provided'
    });
  }

  try {
    const decoded = verifyToken(token);
    console.log('Decoded Token:', decoded); // Log token yang sudah didekode
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verifying token:', error); // Log error yang terjadi
    return res.status(401).json({
      code: 401,
      data: null,
      message: 'Failed to authenticate token'
    });
  }
};

module.exports = authenticate;
