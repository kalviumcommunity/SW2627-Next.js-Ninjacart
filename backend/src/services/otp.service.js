/**
 * ============================================================================
 * 2FA OTP Service (Implemented by Jovab)
 * ============================================================================
 * Purpose: Provides two-factor authentication (2FA) verification for sensitive
 * user flows like Login and Registration.
 *
 * Flow:
 * 1. User submits email during login/registration.
 * 2. Backend generates a secure 6-digit OTP code using Node.js crypto.
 * 3. Enforces a 45-second resend cooldown to prevent spam.
 * 4. Saves the OTP with a 10-minute expiry into PostgreSQL via Prisma.
 * 5. Calls email.service.js to send the code to the user's inbox.
 * 6. When the user submits the code, verifyOtpCode() validates it with a
 *    5-attempt safety limit and invalidates the code immediately after success.
 */

const crypto = require('crypto');
const prisma = require('../config/db');
const { sendOtpEmail } = require('./email.service');

// Security parameters: 10 min expiry, 45s resend cooldown, max 5 attempts before code revocation
const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 45;
const MAX_VERIFICATION_ATTEMPTS = 5;

/**
 * Generate a cryptographically secure 6-digit numeric OTP.
 * Uses crypto.randomInt (not Math.random) for high entropy and unpredictable codes.
 */
function generate6DigitCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Create and send OTP for a given email and purpose
 * @param {string} email - Normalized email address
 * @param {string} purpose - 'REGISTRATION' | 'LOGIN'
 * @param {string} [name] - User or business name
 */
async function createAndSendOtp(email, purpose, name = 'User') {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check for resend cooldown on existing active OTP
  const existingOtp = await prisma.otpVerification.findFirst({
    where: {
      email: normalizedEmail,
      purpose,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (existingOtp) {
    const timeSinceLastSent = (Date.now() - new Date(existingOtp.updatedAt).getTime()) / 1000;
    if (timeSinceLastSent < RESEND_COOLDOWN_SECONDS) {
      const waitTime = Math.ceil(RESEND_COOLDOWN_SECONDS - timeSinceLastSent);
      const error = new Error(`Please wait ${waitTime} seconds before requesting a new OTP.`);
      error.statusCode = 429;
      error.retryAfter = waitTime;
      throw error;
    }
  }

  // 2. Generate new OTP and expiration
  const code = generate6DigitCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // 3. Store/Upsert OTP record in database
  // Remove older OTPs for this email+purpose to keep DB clean
  await prisma.otpVerification.deleteMany({
    where: {
      email: normalizedEmail,
      purpose,
    },
  });

  const otpRecord = await prisma.otpVerification.create({
    data: {
      email: normalizedEmail,
      code,
      purpose,
      expiresAt,
      attempts: 0,
    },
  });

  // 4. Send OTP email
  await sendOtpEmail({
    to: normalizedEmail,
    otp: code,
    purpose,
    name,
  });

  return {
    success: true,
    email: normalizedEmail,
    purpose,
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    cooldownSeconds: RESEND_COOLDOWN_SECONDS,
  };
}

/**
 * Verify a submitted OTP code
 *
 * Viva points to remember:
 * 1. Checks that the code exists and has not passed its 10-minute expiry window.
 * 2. Enforces brute-force protection by capping failed guesses at 5 attempts.
 * 3. On successful match, deletes the record from the database to guarantee single-use.
 *
 * @param {string} email - Normalized email address
 * @param {string} code - Submitted 6-digit OTP
 * @param {string} purpose - 'REGISTRATION' | 'LOGIN'
 */
async function verifyOtpCode(email, code, purpose) {
  const normalizedEmail = email.toLowerCase().trim();
  const trimmedCode = (code || '').toString().trim();

  if (!trimmedCode || trimmedCode.length !== 6) {
    const error = new Error('Invalid OTP code format. Enter a 6-digit code.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Fetch latest OTP record for this email + purpose
  const otpRecord = await prisma.otpVerification.findFirst({
    where: {
      email: normalizedEmail,
      purpose,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otpRecord) {
    const error = new Error('No active verification code found for this email. Please request a new OTP.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Check Expiry
  if (new Date() > new Date(otpRecord.expiresAt)) {
    // Delete expired record
    await prisma.otpVerification.delete({ where: { id: otpRecord.id } }).catch(() => {});
    const error = new Error('Verification code has expired. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Check Attempt Limit
  if (otpRecord.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    await prisma.otpVerification.delete({ where: { id: otpRecord.id } }).catch(() => {});
    const error = new Error('Too many invalid attempts. This verification code has been revoked. Please request a new code.');
    error.statusCode = 429;
    throw error;
  }

  // 4. Check Code Match
  if (otpRecord.code !== trimmedCode) {
    // Increment attempts
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });
    const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - (otpRecord.attempts + 1);
    const error = new Error(
      remainingAttempts > 0
        ? `Incorrect verification code. ${remainingAttempts} attempt(s) remaining.`
        : 'Incorrect verification code. Maximum attempts reached.'
    );
    error.statusCode = 400;
    throw error;
  }

  // 5. Success! Invalidate OTP immediately to prevent reuse
  await prisma.otpVerification.delete({ where: { id: otpRecord.id } }).catch(() => {});

  return { verified: true, email: normalizedEmail, purpose };
}

module.exports = {
  createAndSendOtp,
  verifyOtpCode,
  OTP_EXPIRY_MINUTES,
  RESEND_COOLDOWN_SECONDS,
};
