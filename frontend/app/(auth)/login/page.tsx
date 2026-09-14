'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { loginUser, resendOtp } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, login } = useAuth();

  // If user already has a valid JWT session, OTP is not needed -> redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === 'FARMER' ? '/farmer/dashboard' : '/catalogue');
    }
  }, [isAuthenticated, user, router]);

  // Step: 'CREDENTIALS' | 'OTP'
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Countdown Timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first OTP input when transitioning to OTP step
  useEffect(() => {
    if (step === 'OTP' && otpInputsRef.current[0]) {
      otpInputsRef.current[0]?.focus();
    }
  }, [step]);

  // Mask email for display (e.g. jo***@domain.com)
  const getMaskedEmail = (rawEmail: string) => {
    if (!rawEmail || !rawEmail.includes('@')) return rawEmail;
    const [user, domain] = rawEmail.split('@');
    if (user.length <= 2) return `${user[0]}*@${domain}`;
    return `${user.slice(0, 2)}${'*'.repeat(Math.min(user.length - 2, 4))}@${domain}`;
  };

  // Mask any emails found inside an error or feedback text message
  const maskEmailsInText = (text: string) => {
    if (!text || typeof text !== 'string') return text;
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.replace(emailPattern, (matched) => getMaskedEmail(matched));
  };

  // Step 1: Submit Credentials -> Triggers Login OTP Dispatch
  async function handleCredentialsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setMessage({ text: 'Email and password are required.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginUser({ email: trimmedEmail, password, sendOtp: true });

      // If backend requires OTP verification (Standard 2FA login)
      if (result?.otpRequired) {
        setStep('OTP');
        setCountdown(45);
        setMessage({
          text: `A 6-digit verification code was sent to ${getMaskedEmail(trimmedEmail)}`,
          type: 'success',
        });
        return;
      }

      // If direct login returned (e.g. token already issued)
      const role = result?.data?.role;
      const user = result?.data?.user;
      const token = result?.data?.token;

      if (!token || !user || (role !== 'FARMER' && role !== 'RETAILER')) {
        throw new Error('Login succeeded, but the account role is not recognized.');
      }

      login(token, user, role);
      setMessage({ text: 'Login successful.', type: 'success' });
      router.push(role === 'FARMER' ? '/farmer/dashboard' : '/catalogue');
    } catch (error: any) {
      const rawMsg = error instanceof Error ? error.message : 'Unable to log in.';
      setMessage({
        text: maskEmailsInText(rawMsg),
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle OTP digit inputs & paste
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasteDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      if (pasteDigits.length > 0) {
        const newDigits = [...otpDigits];
        pasteDigits.forEach((d, i) => {
          if (i < 6) newDigits[i] = d;
        });
        setOtpDigits(newDigits);
        const nextFocus = Math.min(pasteDigits.length, 5);
        otpInputsRef.current[nextFocus]?.focus();
      }
      return;
    }

    const cleanChar = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    if (cleanChar && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Step 2: Submit OTP for Login Verification
  async function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setMessage({ text: 'Please enter the complete 6-digit verification code.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginUser({
        email: email.trim().toLowerCase(),
        otp: fullOtp,
      });

      const role = result?.data?.role;
      const user = result?.data?.user;
      const token = result?.data?.token;

      if (!token || !user || (role !== 'FARMER' && role !== 'RETAILER')) {
        throw new Error('Authentication verified, but user profile could not be loaded.');
      }

      login(token, user, role);
      setMessage({ text: 'Verification successful! Accessing account...', type: 'success' });

      setTimeout(() => {
        router.push(role === 'FARMER' ? '/farmer/dashboard' : '/catalogue');
      }, 800);
    } catch (error: any) {
      const rawMsg = error instanceof Error ? error.message : 'Invalid or expired verification code.';
      setMessage({
        text: maskEmailsInText(rawMsg),
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Resend OTP
  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    setMessage(null);
    try {
      await resendOtp({
        email: email.trim().toLowerCase(),
        purpose: 'LOGIN',
      });
      setCountdown(45);
      setOtpDigits(['', '', '', '', '', '']);
      setMessage({
        text: `A fresh 6-digit verification code was sent to ${getMaskedEmail(email.trim())}`,
        type: 'success',
      });
      otpInputsRef.current[0]?.focus();
    } catch (err: any) {
      const rawMsg = err?.message || 'Failed to resend code. Please wait and try again.';
      setMessage({
        text: maskEmailsInText(rawMsg),
        type: 'error',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-form">
        <Link href="/" className="auth-brand" aria-label="Ninjacart home">
          <img src="/ninjacart_logo.png" alt="Ninjacart" className="auth-logo" />
        </Link>

        {step === 'CREDENTIALS' ? (
          <>
            <div className="auth-heading">
              <p className="auth-eyebrow">Welcome back</p>
              <h1>Sign in to Ninjacart</h1>
              <p>Access your wholesale produce marketplace account.</p>
            </div>

            {message && (
              <p className={`auth-message ${message.type}`} role="alert">
                {message.type === 'success' ? '✅ ' : '⚠️ '}
                {message.text}
              </p>
            )}

            <form onSubmit={handleCredentialsSubmit} noValidate>
              <div className="auth-fields">
                <div className="field-group">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-field">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>

              <button className="auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying Credentials...' : 'Sign in →'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  margin: '0 auto 1rem',
                  border: '1px solid #a7f3d0',
                }}
              >
                🔐
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                Two-Factor Verification
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                Enter the 6-digit code sent to
              </p>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', marginTop: '2px' }}>
                {getMaskedEmail(email)}
              </strong>
            </div>

            {message && (
              <p className={`auth-message ${message.type}`} role="alert">
                {message.type === 'success' ? '✅ ' : '⚠️ '}
                {message.text}
              </p>
            )}

            <form onSubmit={handleOtpSubmit} noValidate>
              <div style={{ margin: '1.25rem 0' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem', textAlign: 'center' }}>
                  6-Digit Verification Code
                </label>

                {/* 6 Digit Inputs */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputsRef.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      style={{
                        width: '42px',
                        height: '50px',
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        borderRadius: '8px',
                        border: digit ? '2px solid #10b981' : '1px solid #cbd5e1',
                        backgroundColor: digit ? '#f0fdf4' : '#ffffff',
                        color: '#0f172a',
                        outline: 'none',
                        transition: 'all 0.15s ease',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Back to password & Resend Code Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.825rem',
                  marginBottom: '1.25rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setStep('CREDENTIALS');
                    setMessage(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '0.8rem',
                    textDecoration: 'underline',
                  }}
                >
                  ← Back to password
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || isResending}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: countdown > 0 ? '#94a3b8' : '#16a34a',
                    fontWeight: 600,
                    cursor: countdown > 0 ? 'default' : 'pointer',
                    padding: 0,
                    fontSize: '0.8rem',
                  }}
                >
                  {isResending
                    ? 'Resending...'
                    : countdown > 0
                    ? `Resend in ${countdown}s`
                    : 'Resend Code'}
                </button>
              </div>

              <button
                className="auth-submit"
                type="submit"
                disabled={isSubmitting || otpDigits.join('').length !== 6}
                style={{
                  backgroundColor: isSubmitting || otpDigits.join('').length !== 6 ? '#94a3b8' : '#10b981',
                  cursor: isSubmitting || otpDigits.join('').length !== 6 ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Verifying Code...' : '🔓 Verify & Access Account'}
              </button>
            </form>
          </>
        )}

        <p className="auth-footer">
          New to Ninjacart? <Link href="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}