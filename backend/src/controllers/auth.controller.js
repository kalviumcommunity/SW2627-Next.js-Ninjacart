const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Regular expression for validating email format
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mask email for privacy in error/feedback messages (e.g. jo***@domain.com)
const maskEmail = (rawEmail) => {
  if (!rawEmail || typeof rawEmail !== 'string' || !rawEmail.includes('@')) return rawEmail;
  const [user, domain] = rawEmail.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user.slice(0, 2)}${'*'.repeat(Math.min(user.length - 2, 4))}@${domain}`;
};

/**
 * Register a new User (Direct Registration - No OTP required)
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

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      const error = new Error('Valid email is required');
      error.statusCode = 400;
      return next(error);
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      return next(error);
    }

    const normalizedRole = typeof role === 'string' ? role.toUpperCase().trim() : '';
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

    // 5. Generate JWT for immediate login on register
    const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_ninjacart_fallback';
    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    );

    // 6. Return HTTP 201 with token and user profile
    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Authenticate User (Direct Login with Email and Password - No OTP required)
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

    const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    // 2. Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    // 3. Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_ninjacart_fallback';
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    );

    // 4. Return token and user data without password/hash
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        role: user.role,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Send OTP (Optional Helper for password reset/verification)
 * POST /api/auth/send-otp
 */
const sendOtp = async (req, res, next) => {
  return res.status(200).json({
    success: true,
    message: 'OTP verification is currently disabled.',
  });
};

/**
 * Resend OTP (Optional Helper)
 * POST /api/auth/resend-otp
 */
const resendOtp = async (req, res, next) => {
  return res.status(200).json({
    success: true,
    message: 'OTP verification is currently disabled.',
  });
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        farmer: {
          select: {
            id: true,
            phone: true,
            location: true,
            bio: true,
          },
        },
        retailer: {
          select: {
            id: true,
            storeName: true,
            phone: true,
            location: true,
          },
        },
      },
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmer: user.farmer,
        retailer: user.retailer,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update authenticated user profile
 * PATCH /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phone, location, bio, storeName } = req.body;

    // Update user name if provided
    if (name && typeof name === 'string' && name.trim()) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: name.trim() },
      });
    }

    if (req.user.role === 'FARMER') {
      const farmerData = {};
      if (phone !== undefined) farmerData.phone = phone ? phone.trim() : null;
      if (location !== undefined) farmerData.location = location ? location.trim() : null;
      if (bio !== undefined) farmerData.bio = bio ? bio.trim() : null;

      await prisma.farmer.upsert({
        where: { userId },
        create: {
          userId,
          ...farmerData,
        },
        update: farmerData,
      });
    } else if (req.user.role === 'RETAILER') {
      const retailerData = {};
      if (storeName !== undefined) retailerData.storeName = storeName ? storeName.trim() : null;
      if (phone !== undefined) retailerData.phone = phone ? phone.trim() : null;
      if (location !== undefined) retailerData.location = location ? location.trim() : null;

      await prisma.retailer.upsert({
        where: { userId },
        create: {
          userId,
          ...retailerData,
        },
        update: retailerData,
      });
    }

    // Fetch updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        farmer: {
          select: {
            id: true,
            phone: true,
            location: true,
            bio: true,
          },
        },
        retailer: {
          select: {
            id: true,
            storeName: true,
            phone: true,
            location: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  sendOtp,
  register,
  login,
  resendOtp,
  getMe,
  updateProfile,
};
