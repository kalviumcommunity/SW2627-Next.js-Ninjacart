'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FarmerLayout from '@/components/FarmerLayout';
import { useAuth } from '@/context/AuthContext';
import { getProduces, SAMPLE_PRODUCES, Produce } from '@/lib/api';

export default function FarmerDashboardPage() {
  const { user } = useAuth();
  const farmName = user?.name ? `${user.name}'s Farm` : 'Green Valley Farms';

  const [produces, setProduces] = useState<Produce[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 42,
    activeListings: 38,
    totalOrders: 156,
    revenue: 45200,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getProduces({ limit: 50 });
        const items = res.produces.length > 0 ? res.produces : SAMPLE_PRODUCES;
        setProduces(items);

        const totalProds = items.length;
        const activeCount = items.filter((p) => p.status === 'AVAILABLE' || p.quantity > 0).length;
        const rev = items.reduce((acc, p) => acc + p.price * (p.quantity || 50), 0);

        setStats({
          totalProducts: totalProds,
          activeListings: activeCount,
          totalOrders: Math.round(totalProds * 3.7),
          revenue: rev,
        });
      } catch {
        setProduces(SAMPLE_PRODUCES);
      }
    }
    loadData();
  }, []);

  const recentOrders = [
    {
      id: 'ORD-2094',
      item: produces[0]?.name || 'Organic Tomatoes',
      qty: '50 kg',
      amount: Math.round((produces[0]?.price || 40) * 50),
      status: 'Processing',
      badgeBg: '#fef3c7',
      badgeColor: '#b45309',
    },
    {
      id: 'ORD-2093',
      item: produces[1]?.name || 'Fresh Potatoes',
      qty: '100 kg',
      amount: Math.round((produces[1]?.price || 25) * 100),
      status: 'Shipped',
      badgeBg: '#dbeafe',
      badgeColor: '#1d4ed8',
    },
    {
      id: 'ORD-2092',
      item: produces[2]?.name || 'Red Onions',
      qty: '30 kg',
      amount: Math.round((produces[2]?.price || 30) * 30),
      status: 'Delivered',
      badgeBg: '#dcfce7',
      badgeColor: '#15803d',
    },
    {
      id: 'ORD-2091',
      item: produces[3]?.name || 'Fresh Carrots',
      qty: '20 kg',
      amount: Math.round((produces[3]?.price || 35) * 20),
      status: 'Delivered',
      badgeBg: '#dcfce7',
      badgeColor: '#15803d',
    },
  ];

  return (
    <FarmerLayout>
      {/* Top Welcome Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Welcome, {farmName}
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Here's a quick overview of your farm's performance today.
        </p>
      </div>

      {/* 4 KPI Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total Products */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
              Total Products
            </p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalProducts}</p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            📦
          </div>
        </div>

        {/* Active Listings */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
              Active Listings
            </p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{stats.activeListings}</p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            👁️
          </div>
        </div>

        {/* Total Orders */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
              Total Orders
            </p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalOrders}</p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            🛒
          </div>
        </div>

        {/* Revenue */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
              Revenue (₹)
            </p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a' }}>
              ₹ {stats.revenue.toLocaleString('en-IN')}
            </p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            ₹
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Sales Trend Bar Chart & Recent Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
        {/* Sales Trend Bar Chart */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Sales Trend</h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Weekly Volume</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '200px',
              padding: '0 1rem',
              borderBottom: '1px solid #e2e8f0',
              gap: '1rem',
            }}
          >
            {[
              { label: 'Mon', height: '35%', color: '#dbeafe' },
              { label: 'Tue', height: '55%', color: '#dbeafe' },
              { label: 'Wed', height: '40%', color: '#dbeafe' },
              { label: 'Thu', height: '70%', color: '#dbeafe' },
              { label: 'Fri', height: '60%', color: '#dbeafe' },
              { label: 'Sat', height: '95%', color: '#16a34a' },
              { label: 'Sun', height: '75%', color: '#dbeafe' },
            ].map((bar, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  style={{
                    width: '70%',
                    height: bar.height,
                    backgroundColor: bar.color,
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders List */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Recent Orders</h2>
            <Link
              href="/farmer/orders"
              style={{ fontSize: '0.8rem', fontWeight: 600, color: '#16a34a', textDecoration: 'none' }}
            >
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentOrders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{ord.id}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {ord.item} • {ord.qty}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    ₹{ord.amount.toLocaleString('en-IN')}
                  </p>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: ord.badgeBg,
                      color: ord.badgeColor,
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
}
