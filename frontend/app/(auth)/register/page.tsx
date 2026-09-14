'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { registerUser, sendOtp, resendOtp } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated, login } = useAuth();

  // If user already has a valid JWT session, OTP and registration are not needed -> redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === 'FARMER' ? '/farmer/dashboard' : '/catalogue');
    }
  }, [isAuthenticated, user, router]);

  // Form step: 'DETAILS' | 'OTP'
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');

  // Form State
  const [role, setRole] = useState<'RETAILER' | 'FARMER'>('RETAILER');
  const [name, setName] = useState('');
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

  // Step 1: Send OTP to initiate registration
  async function handleSendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password) {
      setMessage({ text: 'All fields are required.', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await sendOtp({
        email: trimmedEmail,
        purpose: 'REGISTRATION',
        name: trimmedName,
      });

      setStep('OTP');
      setCountdown(45);
      setMessage({
        text: `A 6-digit verification code was sent to ${getMaskedEmail(trimmedEmail)}`,
        type: 'success',
      });
    } catch (err: any) {
      const rawMsg = err?.message || 'Failed to send verification code. Please try again.';
      setMessage({
        text: maskEmailsInText(rawMsg),
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle OTP digit changes & paste
  const handleOtpChange = (index: number, value: string) => {
    // Handle paste event (e.g. "123456")
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

    // Auto focus next input
    if (cleanChar && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP and complete registration
  async function handleVerifyAndRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setMessage({ text: 'Please enter the complete 6-digit verification code.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        otp: fullOtp,
      });

      const user = res?.data?.user || {
        id: res?.data?.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
      };
      const token = res?.data?.token;

      if (token && user) {
        login(token, user, role);
      }

      setMessage({ text: 'Registration successful! Redirecting to your portal...', type: 'success' });
      setTimeout(() => {
        router.push(role === 'FARMER' ? '/farmer/dashboard' : '/catalogue');
      }, 1000);
    } catch (err: any) {
      const rawMsg = err?.message || 'Verification failed. Please check the code and try again.';
      setMessage({
        text: maskEmailsInText(rawMsg),
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Resend OTP action
  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    setMessage(null);
    try {
      await resendOtp({
        email: email.trim().toLowerCase(),
        purpose: 'REGISTRATION',
      });
      setCountdown(45);
      setOtpDigits(['', '', '', '', '', '']);
      setMessage({
        text: `A fresh 6-digit code was sent to ${getMaskedEmail(email.trim())}`,
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
    <div
      style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '2.5rem 2rem',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.04)',
          boxSizing: 'border-box',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <img
              src="/ninjacart_logo.png"
              alt="Ninjacart"
              style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {step === 'DETAILS' ? (
            <>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                Create an Account
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Join Ninjacart's farm-to-retail direct marketplace
              </p>

              {/* Account Role Selector */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  padding: '4px',
                  marginTop: '1.25rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setRole('RETAILER')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: role === 'RETAILER' ? '#ffffff' : 'transparent',
                    color: role === 'RETAILER' ? '#0f172a' : '#64748b',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: role === 'RETAILER' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  🏪 Retail Store
                </button>
                <button
                  type="button"
                  onClick={() => setRole('FARMER')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: role === 'FARMER' ? '#ffffff' : 'transparent',
                    color: role === 'FARMER' ? '#0f172a' : '#64748b',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: role === 'FARMER' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  🧑‍🌾 Farmer / Producer
                </button>
              </div>
            </>
          ) : (
            <>
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
                📬
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                Verify Your Email
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                We sent a 6-digit verification code to
              </p>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', marginTop: '2px' }}>
                {getMaskedEmail(email)}
              </strong>
            </>
          )}
        </div>

        {/* Feedback Message */}
        {message && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              color: message.type === 'success' ? '#065f46' : '#b91c1c',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{message.text}</span>
          </div>
        )}

        {/* STEP 1: Registration Details */}
        {step === 'DETAILS' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                {role === 'FARMER' ? 'Farm / Producer Name *' : 'Full Name / Store Name *'}
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.6rem 0.85rem',
                  gap: '0.65rem',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  required
                  placeholder={role === 'FARMER' ? 'e.g. Green Valley Farms' : 'e.g. Fresh Mart Retailers'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem', color: '#0f172a' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Email Address (OTP will be sent here) *
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.6rem 0.85rem',
                  gap: '0.65rem',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  required
                  placeholder="contact@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem', color: '#0f172a' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Create Password *
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.6rem 0.85rem',
                  gap: '0.65rem',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem', color: '#0f172a' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '0.8rem',
                borderRadius: '8px',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: '0.5rem',
                transition: 'background-color 0.2s ease',
              }}
            >
              {isSubmitting ? 'Sending Verification Code...' : 'Continue to Email Verification →'}
            </button>
          </form>
        )}

        {/* STEP 2: 6-Digit OTP Verification */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem', textAlign: 'center' }}>
                Enter the 6-Digit Code
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

            {/* Resend OTP & Change Email Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.825rem',
                marginTop: '0.25rem',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setStep('DETAILS');
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
                ← Edit details
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
              type="submit"
              disabled={isSubmitting || otpDigits.join('').length !== 6}
              style={{
                backgroundColor: isSubmitting || otpDigits.join('').length !== 6 ? '#94a3b8' : '#16a34a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '0.85rem',
                borderRadius: '8px',
                border: 'none',
                cursor: isSubmitting || otpDigits.join('').length !== 6 ? 'not-allowed' : 'pointer',
                marginTop: '0.5rem',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                transition: 'all 0.2s ease',
              }}
            >
              {isSubmitting ? 'Verifying Code...' : '🌱 Verify & Complete Registration'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ fontWeight: 600, color: '#16a34a', textDecoration: 'none' }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}