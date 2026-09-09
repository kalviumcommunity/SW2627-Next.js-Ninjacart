'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProduces, Produce } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function FarmerDashboardPage() {
  const { user, role, isAuthenticated, isLoading: authLoading } = useAuth();
  const effectiveRole = role || user?.role;
  const isFarmer = effectiveRole === "FARMER";

  const [produces, setProduces] = useState<Produce[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function fetchData() {
      if (authLoading || !isFarmer) {
        setIsLoading(false);
        return;
      }
      
      try {
        if (!user) {
          setError('User not found. Please log in.');
          setIsLoading(false);
          return;
        }

        // Fetch all produces and filter by current user's farmer profile
        const data = await getProduces({ limit: 100 });
        const myProduces = data.produces.filter((p: Produce) => p.farmer?.userId === user.id);
        setProduces(myProduces);
      } catch (err: any) {
        setError(err.message || 'Failed to load produces');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [user, authLoading, isFarmer]);

  const activeListings = produces.filter((p: Produce) => p.status === 'AVAILABLE' || p.status === 'LOW_STOCK').length;
  const totalEarnings = 0; // Placeholder for earnings calculation if orders were fetched

  if (authLoading) {
    return (
      <div style={{ maxWidth: "1000px", margin: "3rem auto", padding: "2rem", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            width: "48px",
            height: "48px",
            border: "4px solid #e2e8f0",
            borderTopColor: "#10b981",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: "1rem", color: "#64748b" }}>Loading Farmer Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          maxWidth: "540px",
          margin: "4rem auto",
          padding: "2.5rem",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            backgroundColor: "#fef3c7",
            color: "#d97706",
            fontSize: "1.75rem",
            marginBottom: "1.25rem",
          }}
        >
          🔒
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
          Farmer Authentication Required
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          Please sign in to your registered farmer account to access your farm dashboard, manage inventory, and list produce.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            href="/login?redirect=/farmer/dashboard"
            style={{
              padding: "0.85rem 1.5rem",
              backgroundColor: "#10b981",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
            }}
          >
            Sign In to Farmer Portal
          </Link>
          <Link
            href="/register"
            style={{
              padding: "0.85rem 1.5rem",
              backgroundColor: "#f8fafc",
              color: "#334155",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.95rem",
              border: "1px solid #cbd5e1",
              textDecoration: "none",
            }}
          >
            Register as Farmer
          </Link>
        </div>
      </div>
    );
  }

  if (!isFarmer) {
    return (
      <div
        style={{
          maxWidth: "540px",
          margin: "4rem auto",
          padding: "2.5rem",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #fee2e2",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            fontSize: "1.75rem",
            marginBottom: "1.25rem",
          }}
        >
          🚫
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
          Farmer Portal Access Only
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          You are signed in as a <strong>{effectiveRole || "Retailer"}</strong>. The Farmer Dashboard is exclusively accessible to registered farmers.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            href="/catalogue"
            style={{
              padding: "0.85rem 1.5rem",
              backgroundColor: "#10b981",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
            }}
          >
            Browse Wholesale Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="page-container animate-fade-in" style={{ padding: "0 1.5rem" }}>
      <div className="page-header" style={{ marginBottom: "2rem", marginTop: "2rem" }}>
        <h1 className="page-title" style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Farmer Dashboard</h1>
        <p className="page-subtitle" style={{ color: "#64748b", fontSize: "1rem" }}>Manage your farm's inventory and view your active orders.</p>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Quick Actions Card */}
        <div className="metric-card glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 2rem', border: "1px solid #e2e8f0", borderRadius: "16px", backgroundColor: "#fff" }}>
          <div style={{ background: '#ecfdf5', color: '#10b981', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>List New Produce</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Add fresh harvests to the catalogue</p>
          <Link 
            href="/farmer/add-produce"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#10b981",
              color: "#ffffff",
              borderRadius: "8px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Add Produce
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="metric-card glass-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '2.5rem 2rem', borderRadius: "16px" }}>
          <h3 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>This Month's Earnings</h3>
          <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>₹{totalEarnings.toFixed(2)}</div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: "0.25rem" }}>Active Listings</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{activeListings}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: "0.25rem" }}>Total Produce</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{produces.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>My Produce Listings</h2>
        
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}

        {!isLoading && !error && produces.length === 0 && (
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌾</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>No listings yet</h3>
            <p style={{ color: '#64748b' }}>You haven't added any produce yet. Click "Add Produce" to get started.</p>
          </div>
        )}

        {!isLoading && !error && produces.length > 0 && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {produces.map((produce: Produce) => (
              <div key={produce.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
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
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{produce.price}</span> / {produce.unit} &bull; {produce.quantity} {produce.unit} in stock
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
  );
}
