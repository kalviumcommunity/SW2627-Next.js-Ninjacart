'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, login } = useAuth();

  // If user already has a session, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === 'FARMER' ? '/farmer/dashboard' : '/catalogue');
    }
  }, [isAuthenticated, user, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Form submission handler for direct password login
   * Flow:
   * 1. Validates non-empty email and password inputs.
   * 2. Calls loginUser({ email, password }) -> POST /api/auth/login.
   * 3. Stores JWT token in localStorage and AuthContext.
   * 4. Role-based redirect: FARMER -> /farmer/dashboard, RETAILER -> /catalogue.
   */
  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setMessage({ text: 'Email and password are required.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginUser({ email: trimmedEmail, password });

      const role = result?.data?.role;
      const userData = result?.data?.user;
      const token = result?.data?.token;

      if (!token || !userData || (role !== 'FARMER' && role !== 'RETAILER')) {
        throw new Error('Login succeeded, but the account role is not recognized.');
      }

      login(token, userData, role);
      setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
      setTimeout(() => {
        router.push(role === 'FARMER' ? '/farmer/dashboard' : '/catalogue');
      }, 500);
    } catch (error: any) {
      const rawMsg = error instanceof Error ? error.message : 'Invalid email or password.';
      setMessage({
        text: rawMsg,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-form">
        <Link href="/" className="auth-brand" aria-label="Ninjacart home">
          <img src="/ninjacart_logo.png" alt="Ninjacart" className="auth-logo" />
        </Link>

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

        <form onSubmit={handleLoginSubmit} noValidate>
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
            {isSubmitting ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p className="auth-footer">
          New to Ninjacart? <Link href="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}