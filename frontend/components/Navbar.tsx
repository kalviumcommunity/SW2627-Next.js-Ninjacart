'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/catalogue');
    }
  };

  return (
    <header className="navbar" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0.75rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.75rem', color: '#16a34a' }}>🌿</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>KhetKart</span>
        </Link>

        {/* Search Bar - only shown if on catalogue or retailer, and NOT on auth pages */}
        {!(pathname === '/login' || pathname === '/register') && (pathname?.startsWith('/catalogue') || user?.role === 'RETAILER' || !user) && (
          <div style={{ flex: '0 1 600px', margin: '0 2rem' }}>
            <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="Search produce, e.g., tomatoes, onions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.65rem 1rem 0.65rem 2.75rem', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0', 
                  backgroundColor: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }} 
              />
            </form>
          </div>
        )}

        {/* Right Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Cart - only for retailers */}
          {(user?.role === 'RETAILER' || !user) && (
            <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#334155', fontWeight: 500, fontSize: '0.95rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Cart
              <span style={{ backgroundColor: '#16a34a', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '12px' }}>2</span>
            </Link>
          )}
          
          {user?.role === 'FARMER' && (
            <Link href="/farmer/dashboard" className={`nav-link ${pathname?.startsWith('/farmer') ? 'active' : ''}`} style={{ fontSize: '0.95rem' }}>
              Dashboard
            </Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'default', padding: '0.4rem 0.8rem', borderRadius: '8px', backgroundColor: '#f1f5f9' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                  {user.role === 'RETAILER' ? 'Retailer' : 'Farmer'}
                </span>
              </div>
              <button 
                onClick={logout}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#ef4444', 
                  fontWeight: 600, 
                  fontSize: '0.9rem', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
              <Link href="/login" className="nav-btn-login">
                Sign In
              </Link>
              <Link href="/register" className="nav-btn-register">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
