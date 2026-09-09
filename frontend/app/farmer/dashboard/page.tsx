'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import { getProduces, Produce } from '@/lib/api';

// Fallback to local storage for user if AuthProvider context is not available easily
function getLocalUser() {
  try {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
  } catch {
    return null;
  }
  return null;
}

export default function FarmerDashboardPage() {
  const [produces, setProduces] = useState<Produce[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function fetchData() {
      try {
        const user = getLocalUser();
        if (!user) {
          setError('User not found. Please log in.');
          setIsLoading(false);
          return;
        }

        // Fetch all produces and filter by current user's farmer profile
        const data = await getProduces({ limit: 100 });
        const myProduces = data.produces.filter(p => p.farmer?.userId === user.id);
        setProduces(myProduces);
      } catch (err: any) {
        setError(err.message || 'Failed to load produces');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const activeListings = produces.filter(p => p.status === 'AVAILABLE' || p.status === 'LOW_STOCK').length;
  const totalEarnings = 0; // Placeholder for earnings calculation if orders were fetched

  return (
    <AuthGuard requiredRole="FARMER">
      <main className="page-container animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Farmer Dashboard</h1>
          <p className="page-subtitle">Manage your farm's inventory and view your active orders.</p>
        </div>

        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {/* Quick Actions Card */}
          <div className="metric-card glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>List New Produce</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Add fresh harvests to the catalogue</p>
            <Link 
              href="/farmer/add-produce"
              className="btn btn-primary"
            >
              Add Produce
            </Link>
          </div>

          {/* Stats Summary */}
          <div className="metric-card glass-card" style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, #0f172a 100%)', color: 'white', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>This Month's Earnings</h3>
            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>₹{totalEarnings.toFixed(2)}</div>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Active Listings</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{activeListings}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Total Produce</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{produces.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Produce Listings</h2>
          
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              {error}
            </div>
          )}

          {!isLoading && !error && produces.length === 0 && (
            <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌾</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No listings yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>You haven't added any produce yet. Click "Add Produce" to get started.</p>
            </div>
          )}

          {!isLoading && !error && produces.length > 0 && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {produces.map((produce) => (
                <div key={produce.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                      <img 
                        src={produce.imageUrl || "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=150&q=80"} 
                        alt={produce.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{produce.name}</h3>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 500, color: '#0f172a' }}>₹{produce.price}</span> / {produce.unit} &bull; {produce.quantity} {produce.unit} in stock
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      padding: '0.35rem 0.75rem', 
                      borderRadius: '16px', 
                      fontSize: '0.8rem', 
                      fontWeight: 600,
                      backgroundColor: produce.status === 'AVAILABLE' ? '#dcfce7' : produce.status === 'LOW_STOCK' ? '#fef9c3' : '#f1f5f9',
                      color: produce.status === 'AVAILABLE' ? '#166534' : produce.status === 'LOW_STOCK' ? '#854d0e' : '#475569'
                    }}>
                      {produce.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
