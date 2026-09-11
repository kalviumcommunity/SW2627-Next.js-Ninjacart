'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { registerUser } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<'RETAILER' | 'FARMER'>('RETAILER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    if (!name.trim() || !email.trim() || !password) {
      setMessage('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({ name: name.trim(), email: email.trim(), password, role });
      const user = res?.data?.user || { id: res?.data?.id, name: name.trim(), email: email.trim() };
      const token = res?.data?.token;

      if (token && user) {
        login(token, user, role);
      }
      router.push(role === 'FARMER' ? '/farmer/dashboard' : '/catalogue');
    } catch (err: any) {
      setMessage(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '2.5rem',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>
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
        </div>

        {message && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              {role === 'FARMER' ? 'Farm / Producer Name' : 'Full Name / Store Name'}
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
              Email Address
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
              Password
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
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
            }}
          >
            {isSubmitting ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
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