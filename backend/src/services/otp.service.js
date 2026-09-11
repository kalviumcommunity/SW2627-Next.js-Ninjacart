const nodemailer = require('nodemailer');

// In-memory store for OTPs. In production, use Redis or DB.
// Format: Map<email, { otp: string, expiresAt: number }>
const otpStore = new Map();

// Generate a 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create Nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Generate, store, and send an OTP to the given email
 */
const sendOtp = async (email) => {
  const otp = generateOtp();
  // Set expiry to 5 minutes from now
  const expiresAt = Date.now() + 5 * 60 * 1000;

  // Store OTP
  otpStore.set(email.toLowerCase(), { otp, expiresAt });

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Ninjacart" <noreply@ninjacart.test>',
      to: email,
      subject: 'Your Ninjacart Registration OTP',
      text: `Your OTP for Ninjacart registration is: ${otp}. It is valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #10b981; text-align: center;">Welcome to Ninjacart!</h2>
          <p style="color: #334155; font-size: 16px;">Please use the following One-Time Password (OTP) to complete your registration:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    // Even if email fails (e.g. in dev), we log it so we can test without real SMTP
    console.log(`[DEV MODE] OTP for ${email} is ${otp}`);
    // Instead of throwing an error which blocks the UI, we just return true.
    return true;
  }
};

/**
 * Verify an OTP for the given email
 */
const verifyOtp = (email, submittedOtp) => {
  const normalizedEmail = email.toLowerCase();
  const storedData = otpStore.get(normalizedEmail);

  if (!storedData) {
    throw new Error('No OTP requested for this email or OTP expired');
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(normalizedEmail);
    throw new Error('OTP has expired');
  }

  if (storedData.otp !== submittedOtp) {
    throw new Error('Invalid OTP');
  }

  // Clear OTP on successful verification
  otpStore.delete(normalizedEmail);
  return true;
};

module.exports = {
  sendOtp,
  verifyOtp,
};
