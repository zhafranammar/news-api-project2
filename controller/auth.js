const { User } = require('../models');
const bcrypt = require('bcrypt');
const { generateToken } = require('../helper/jwt')

const register = async (req, res) => {
  const { username, email, password, phone } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({
      code: 400,
      data: null,
      message: 'Required fields are missing',
    });
  }
  try {
    // Cek apakah email sudah digunakan
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: 'Email already in use'
      });
    }

    // Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat pengguna baru
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      code: 200,
      data: {
        user: newUser,
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: null,
      message: 'Internal server error'
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cek apakah pengguna ada di database
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        code: 400,
        data: null,
        message: 'Invalid email or password'
      });
    }

    // Periksa password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        data: null,
        message: 'Invalid email or password'
      });
    }

    // Buat token JWT
    const token = generateToken({ userId: user.id, email: user.email });

    return res.status(200).json({
      code: 200,
      data: { token },
      message: 'Login successful'
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: null,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  register, login
};