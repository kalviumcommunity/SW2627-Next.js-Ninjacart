const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Regular expression for validating email format
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register a new User and corresponding Farmer/Retailer profile
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      const error = new Error('Name is required');
      error.statusCode = 400;
      return next(error);
    }

    if (
      !email ||
      typeof email !== 'string' ||
      !EMAIL_REGEX.test(email.trim())
    ) {
      const error = new Error('Valid email is required');
      error.statusCode = 400;
      return next(error);
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      return next(error);
    }

    const normalizedRole =
      typeof role === 'string' ? role.toUpperCase().trim() : '';
    if (!['FARMER', 'RETAILER'].includes(normalizedRole)) {
      const error = new Error('Role must be either FARMER or RETAILER');
      error.statusCode = 400;
      return next(error);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 409;
      return next(error);
    }

    // 3. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create User and linked profile in single transaction
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: normalizedRole,
        ...(normalizedRole === 'FARMER' ? { farmer: { create: {} } } : {}),
        ...(normalizedRole === 'RETAILER' ? { retailer: { create: {} } } : {}),
      },
    });

    // 5. Return HTTP 201 without password/hash
    return res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Authenticate User and return JWT
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      return next(error);
    }

    const normalizedEmail =
      typeof email === 'string' ? email.toLowerCase().trim() : '';

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    // 2. Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    // 3. Ensure JWT_SECRET is configured
    const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_ninjacart_fallback_2026';
    if (!jwtSecret) {
      console.error(
        'FATAL: JWT_SECRET environment variable is not configured.'
      );
      const error = new Error('JWT_SECRET is not configured on server');
      error.statusCode = 500;
      return next(error);
    }

    // 4. Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    );

    // 5. Return token and user data without password/hash
    return res.status(200).json({
      success: true,
      data: {
        token,
        role: user.role,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is set by authenticate middleware
    return res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
