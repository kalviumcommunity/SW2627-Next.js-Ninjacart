'use client';

import React, { useState, useEffect } from 'react';
import FarmerLayout from '@/components/FarmerLayout';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/lib/api';

export default function FarmerProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.farmer?.phone || '');
      setLocation(user.farmer?.location || '');
      setBio(user.farmer?.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        bio: bio.trim(),
      });
      await refreshUser();
      setMessage({ text: 'Farm profile saved successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ text: err?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FarmerLayout>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            marginBottom: '0.25rem',
          }}
        >
          Farm & Producer Profile
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Manage your farm details, contact information, and public marketplace description.
        </p>
      </div>

      {message && (
        <div
          style={{
            backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            color: message.type === 'success' ? '#065f46' : '#dc2626',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{message.text}</span>
        </div>
      )}

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '2rem',
          maxWidth: '680px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Farm Avatar / Banner Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                border: '1px solid #a7f3d0',
              }}
            >
              🚜
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                {name || 'Farm Producer'}
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Verified Farmer Account • {email}
              </span>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="farmer-name"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}
            >
              Producer / Farm Name *
            </label>
            <input
              id="farmer-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Ramesh Patel / Green Valley Farms"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Email (Readonly) */}
          <div>
            <label
              htmlFor="farmer-email"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}
            >
              Email Address (Login ID)
            </label>
            <input
              id="farmer-email"
              type="email"
              value={email}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.95rem',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                cursor: 'not-allowed',
              }}
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="farmer-phone"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}
            >
              Phone / Contact Number
            </label>
            <input
              id="farmer-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="farmer-location"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}
            >
              Farm Location / Region
            </label>
            <input
              id="farmer-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Nashik, Maharashtra"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="farmer-bio"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}
            >
              Farm Bio & Farming Practices
            </label>
            <textarea
              id="farmer-bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell retailers about your crops, organic certifications, soil methods, and harvest cycles..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: '0.85rem 1.5rem',
              backgroundColor: isSaving ? '#94a3b8' : '#10b981',
              color: '#ffffff',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '1rem',
              border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
              transition: 'background-color 0.2s ease',
            }}
          >
            {isSaving ? 'Saving Profile...' : 'Save Farm Profile'}
          </button>
        </form>
      </div>
    </FarmerLayout>
  );
}
