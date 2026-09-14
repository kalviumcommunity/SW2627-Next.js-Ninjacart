'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Produce, getProduces, SAMPLE_PRODUCES } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function RetailerHomePage() {
  const router = useRouter();
  const { addItem } = useCart();
  const { user, role } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProduces, setFeaturedProduces] = useState<Produce[]>([]);
  const [recentProduces, setRecentProduces] = useState<Produce[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);

  const isFarmer = (role || user?.role) === 'FARMER';
  const firstName = user?.name ? user.name.trim().split(' ')[0] : 'Retailer';

  useEffect(() => {
    // If logged in as a farmer, redirect to farmer dashboard
    if (isFarmer) {
      router.push('/farmer/dashboard');
      return;
    }

    async function loadData() {
      try {
        const res = await getProduces({ limit: 12, sortBy: 'createdAt', order: 'desc' });
        const list = res.produces.length > 0 ? res.produces : SAMPLE_PRODUCES;
        setFeaturedProduces(list.slice(0, 4));
        setRecentProduces(list.slice(4, 8).length > 0 ? list.slice(4, 8) : list.slice(0, 4));
      } catch {
        setFeaturedProduces(SAMPLE_PRODUCES.slice(0, 4));
        setRecentProduces(SAMPLE_PRODUCES.slice(2, 6));
      }
    }
    loadData();
  }, [isFarmer, router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/catalogue');
    }
  };

  const handleAddToCart = (produce: Produce, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(produce, 1);
    setAddedId(produce.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const categories = [
    { name: 'Vegetables', icon: '🥬', key: 'VEGETABLES' },
    { name: 'Fruits', icon: '🍎', key: 'FRUITS' },
    { name: 'Grains', icon: '🌾', key: 'GRAINS' },
    { name: 'Dairy & Eggs', icon: '🥛', key: 'DAIRY' },
    { name: 'Meat', icon: '🥩', key: 'OTHER' },
    { name: 'Others', icon: '📦', key: 'OTHER' },
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
        {/* Welcome Banner */}
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '3rem 2rem',
            textAlign: 'center',
            marginBottom: '2.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <img
              src="/ninjacart_logo.png"
              alt="Ninjacart"
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem',
            }}
          >
            Welcome back, {firstName}!
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto 1.75rem',
              lineHeight: 1.5,
            }}
          >
            Find the freshest produce directly from local farms. Search our extensive catalog to stock your shelves today.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              maxWidth: '580px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.65rem 1rem',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: '0.65rem', flexShrink: 0 }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for tomatoes, onions, apples..."
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  width: '100%',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '0.65rem 1.4rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              Browse Products
            </button>
          </form>
        </section>

        {/* Product Categories */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
            Product Categories
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/catalogue?category=${cat.key}`}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textDecoration: 'none',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    backgroundColor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  {cat.icon}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Featured Products</h2>
            <Link
              href="/catalogue"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: '#16a34a', textDecoration: 'none' }}
            >
              View All
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {featuredProduces.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/catalogue/${item.id}`)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.15s ease',
                }}
              >
                {/* Image */}
                <div
                  style={{
                    height: '140px',
                    backgroundColor: '#eef2f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                </div>

                {/* Details */}
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
                    {item.farmer?.user?.name || 'Local Farm'} • {item.quantity} {item.unit || 'kg'} Available
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                      ₹{item.price.toFixed(2)}
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>/{item.unit || 'kg'}</span>
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(item, e)}
                      style={{
                        backgroundColor: addedId === item.id ? '#15803d' : '#f8fafc',
                        color: addedId === item.id ? '#ffffff' : '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {addedId === item.id ? '✓ Added' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Added */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Recently Added</h2>
            <Link
              href="/catalogue"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: '#16a34a', textDecoration: 'none' }}
            >
              View All
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {recentProduces.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/catalogue/${item.id}`)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {/* New Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#64748b',
                    zIndex: 10,
                  }}
                >
                  New
                </div>

                {/* Image */}
                <div
                  style={{
                    height: '140px',
                    backgroundColor: '#eef2f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                </div>

                {/* Details */}
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
                    {item.farmer?.user?.name || 'Local Farm'} • {item.quantity} {item.unit || 'kg'} Available
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                      ₹{item.price.toFixed(2)}
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>/{item.unit || 'kg'}</span>
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(item, e)}
                      style={{
                        backgroundColor: addedId === item.id ? '#15803d' : '#f8fafc',
                        color: addedId === item.id ? '#ffffff' : '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {addedId === item.id ? '✓ Added' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
