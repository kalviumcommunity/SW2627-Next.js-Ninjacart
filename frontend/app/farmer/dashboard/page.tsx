'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FarmerLayout from '@/components/FarmerLayout';
import { useAuth } from '@/context/AuthContext';
import { getProduces, getOrders, Produce } from '@/lib/api';

export default function FarmerDashboardPage() {
  const { user } = useAuth();
  const farmName = user?.name ? `${user.name}'s Farm` : 'My Farm';

  const [produces, setProduces] = useState<Produce[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeListings: 0,
    totalOrders: 0,
    revenue: 0,
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [produceRes, ordersRes] = await Promise.all([
          getProduces({ status: 'ALL', limit: 100 }).catch(() => ({ produces: [], pagination: { total: 0 } })),
          getOrders().catch(() => []),
        ]);

        const items = produceRes?.produces || [];
        const orderList = Array.isArray(ordersRes) ? ordersRes : [];

        setProduces(items);
        setOrders(orderList);

        const totalProds = items.length;
        const activeCount = items.filter((p) => p.status === 'AVAILABLE' && p.quantity > 0).length;

        // Calculate real revenue from placed orders
        let totalRev = 0;
        orderList.forEach((ord: any) => {
          if (ord.totalAmount) {
            totalRev += Number(ord.totalAmount);
          } else if (Array.isArray(ord.items)) {
            ord.items.forEach((it: any) => {
              totalRev += (Number(it.priceAtOrder) || Number(it.produce?.price) || 0) * (Number(it.quantity) || 1);
            });
          }
        });

        setStats({
          totalProducts: totalProds,
          activeListings: activeCount,
          totalOrders: orderList.length,
          revenue: totalRev,
        });
      } catch (err) {
        console.error('Error loading farmer dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const [produceRes, ordersRes] = await Promise.all([
        getProduces({ status: 'ALL', limit: 100 }).catch(() => ({ produces: [], pagination: { total: 0 } })),
        getOrders().catch(() => []),
      ]);

      const items = produceRes?.produces || [];
      const orderList = Array.isArray(ordersRes) ? ordersRes : [];

      setProduces(items);
      setOrders(orderList);

      const totalProds = items.length;
      const activeCount = items.filter((p) => p.status === 'AVAILABLE' && p.quantity > 0).length;

      let totalRev = 0;
      orderList.forEach((ord: any) => {
        if (ord.totalAmount) {
          totalRev += Number(ord.totalAmount);
        } else if (Array.isArray(ord.items)) {
          ord.items.forEach((it: any) => {
            totalRev += (Number(it.priceAtOrder) || Number(it.produce?.price) || 0) * (Number(it.quantity) || 1);
          });
        }
      });

      setStats({
        totalProducts: totalProds,
        activeListings: activeCount,
        totalOrders: orderList.length,
        revenue: totalRev,
      });
    } catch (err) {
      console.error('Error refreshing farmer dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FarmerLayout>
      {/* Top Welcome Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Welcome, {farmName}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Here's a live overview of your farm's produce listings and retail orders.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#334155',
          }}
        >
          <span>🔄</span>
          <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="farmer-kpi-grid">
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            minWidth: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
              Total Listings
            </p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {isLoading ? '...' : stats.totalProducts}
            </p>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            minWidth: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
              Active in Catalogue
            </p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', margin: 0 }}>
              {isLoading ? '...' : stats.activeListings}
            </p>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
            🌱
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            minWidth: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
              Orders Received
            </p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {isLoading ? '...' : stats.totalOrders}
            </p>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
            🛍️
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            minWidth: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>
              Total Earnings
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isLoading ? '...' : `₹ ${stats.revenue.toLocaleString('en-IN')}`}
            </p>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: '#16a34a', fontWeight: 800, flexShrink: 0 }}>
            ₹
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Quick Actions & Live Recent Orders */}
      <div className="farmer-dashboard-main-grid">
        {/* Quick Management Shortcuts */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            minWidth: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Quick Management</h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Direct Actions</span>
          </div>

          <div className="farmer-quick-actions-grid">
            <Link
              href="/farmer/add-produce"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                textDecoration: 'none',
                color: '#166534',
                transition: 'all 0.2s ease',
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>🌱</span>
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Add Produce</strong>
                <span style={{ fontSize: '0.75rem', color: '#15803d', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>List fresh harvest</span>
              </div>
            </Link>

            <Link
              href="/farmer/stock"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                textDecoration: 'none',
                color: '#1e40af',
                transition: 'all 0.2s ease',
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📦</span>
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Manage Stock</strong>
                <span style={{ fontSize: '0.75rem', color: '#2563eb', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Adjust quantity & price</span>
              </div>
            </Link>

            <Link
              href="/farmer/listings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: '#faf5ff',
                border: '1px solid #e9d5ff',
                borderRadius: '10px',
                textDecoration: 'none',
                color: '#6b21a8',
                transition: 'all 0.2s ease',
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📋</span>
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>My Listings</strong>
                <span style={{ fontSize: '0.75rem', color: '#7e22ce', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>View all produce ({produces.length})</span>
              </div>
            </Link>

            <Link
              href="/farmer/analytics"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '10px',
                textDecoration: 'none',
                color: '#92400e',
                transition: 'all 0.2s ease',
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📊</span>
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Farm Analytics</strong>
                <span style={{ fontSize: '0.75rem', color: '#b45309', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>View revenue insights</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Live Recent Orders List */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            minWidth: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Orders</h2>
            <Link
              href="/farmer/orders"
              style={{ fontSize: '0.8rem', fontWeight: 600, color: '#16a34a', textDecoration: 'none', flexShrink: 0 }}
            >
              View All ({orders.length})
            </Link>
          </div>

          {isLoading ? (
            <p style={{ fontSize: '0.875rem', color: '#64748b', padding: '1rem 0' }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🛒</span>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                No orders received yet
              </p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                When retail stores order your produce, their orders will appear here in real time.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {orders.slice(0, 5).map((ord: any) => {
                const firstItem = ord.items?.[0]?.produce?.name || 'Produce Item';
                const itemCount = ord.items?.length || 1;
                const buyer = ord.retailer?.user?.name || ord.retailer?.storeName || 'Retailer';
                const total = ord.totalAmount || ord.items?.reduce((sum: number, it: any) => sum + (it.priceAtOrder || it.produce?.price || 0) * (it.quantity || 1), 0) || 0;

                return (
                  <div
                    key={ord.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0',
                      borderBottom: '1px solid #f1f5f9',
                      gap: '0.75rem',
                      minWidth: 0,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        #{ord.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {firstItem}{itemCount > 1 ? ` +${itemCount - 1} more` : ''} • {buyer}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a', margin: 0 }}>
                        ₹{Number(total).toLocaleString('en-IN')}
                      </p>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: ord.status === 'DELIVERED' ? '#dcfce7' : ord.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                          color: ord.status === 'DELIVERED' ? '#15803d' : ord.status === 'CANCELLED' ? '#b91c1c' : '#b45309',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          marginTop: '2px',
                        }}
                      >
                        {ord.status || 'CONFIRMED'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </FarmerLayout>
  );
}
