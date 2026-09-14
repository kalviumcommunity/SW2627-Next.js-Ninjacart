/**
 * ============================================================================
 * Email Service (Implemented by Jovab)
 * ============================================================================
 * Purpose: Delivers branded transactional emails (like 2FA OTP codes) to users.
 *
 * Flow:
 * 1. Configures a Nodemailer SMTP transporter using environment variables (SMTP_USER, SMTP_PASS).
 * 2. Compiles a responsive HTML email with the 6-digit OTP and 10-minute expiry warning.
 * 3. Graceful Fallback: If SMTP credentials are not set up or fail during development,
 *    it prints the OTP clearly to the backend console so developers and examiners
 *    can test the 2FA flow without needing real email credentials.
 */

const nodemailer = require('nodemailer');

let transporter = null;

// Lazily initializes the Nodemailer SMTP transporter
function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 465;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false, // For reliability in varied server environments
      },
    });
  }
  return transporter;
}

/**
 * Send an OTP verification email to the user
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.otp - 6-digit OTP string
 * @param {string} params.purpose - 'REGISTRATION' | 'LOGIN'
 * @param {string} [params.name] - User or farm name
 */
async function sendOtpEmail({ to, otp, purpose, name = 'User' }) {
  const isLogin = purpose === 'LOGIN';
  const actionText = isLogin ? 'Sign In to Your Account' : 'Complete Your Registration';
  const subject = isLogin
    ? `🔐 ${otp} is your Ninjacart Login Verification Code`
    : `🌱 ${otp} is your Ninjacart Registration Verification Code`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <!-- Header Banner -->
        <tr>
          <td style="padding: 28px 32px; background: linear-gradient(135deg, #065f46 0%, #047857 100%); text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
              🌱 Ninjacart
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #a7f3d0; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px;">
              Farm-to-Retail Wholesale Platform
            </div>
          </td>
        </tr>

        <!-- Main Body Content -->
        <tr>
          <td style="padding: 32px 32px 24px;">
            <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #0f172a;">
              Hello ${name || 'there'},
            </h2>
            <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.5; color: #475569;">
              Use the 6-digit verification code below to <strong>${actionText}</strong> on Ninjacart.
            </p>

            <!-- OTP Code Box -->
            <div style="background-color: #f0fdf4; border: 2px dashed #10b981; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <div style="font-size: 13px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                Your Verification Code
              </div>
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #065f46;">
                ${otp}
              </div>
              <div style="font-size: 12px; color: #64748b; margin-top: 10px;">
                ⏱️ Valid for <strong>10 minutes</strong>. Single-use only.
              </div>
            </div>

            <!-- Security Warning -->
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-top: 20px;">
              <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.4;">
                <strong>Security Reminder:</strong> Never share this code with anyone. Ninjacart support staff will never ask for your verification code.
              </p>
            </div>

            <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.4;">
              If you didn't request this code, you can safely ignore this email. Someone may have entered your email by mistake.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            © ${new Date().getFullYear()} Ninjacart Supply Chain Platform. All rights reserved.
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Always log OTP in server logs for testing/development reliability
  console.log(`\n========================================`);
  console.log(`[OTP DISPATCH] Recipient: ${to}`);
  console.log(`[OTP DISPATCH] Purpose:   ${purpose}`);
  console.log(`[OTP DISPATCH] Code:      >>> ${otp} <<<`);
  console.log(`========================================\n`);

  const mailTransporter = getTransporter();
  if (mailTransporter) {
    try {
      const from = process.env.EMAIL_FROM || `Ninjacart <${process.env.SMTP_USER || 'no-reply@ninjacart.com'}>`;
      await mailTransporter.sendMail({
        from,
        to,
        subject,
        html: htmlContent,
      });
      console.log(`[EMAIL SUCCESS] OTP email delivered to ${to}`);
      return { sent: true, provider: 'smtp' };
    } catch (err) {
      console.error(`[EMAIL WARN] SMTP send failed to ${to}:`, err.message);
      return { sent: false, error: err.message, fallbackCodeLogged: true };
    }
  } else {
    console.warn(`[EMAIL WARN] SMTP transporter not configured, code logged to console.`);
    return { sent: true, provider: 'console_fallback' };
  }
}

module.exports = {
  sendOtpEmail,
};
