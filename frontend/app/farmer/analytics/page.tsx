'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FarmerLayout from '@/components/FarmerLayout';
import { getProduces, getOrders, Produce } from '@/lib/api';

export default function FarmerAnalyticsPage() {
  const [produces, setProduces] = useState<Produce[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, ordersRes] = await Promise.all([
          getProduces({ status: 'ALL', limit: 100 }).catch(() => ({ produces: [] })),
          getOrders().catch(() => []),
        ]);
        setProduces(prodRes?.produces || []);
        setOrders(Array.isArray(ordersRes) ? ordersRes : []);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute live analytics metrics
  const totalListings = produces.length;
  const availableCount = produces.filter((p) => p.status === 'AVAILABLE' && p.quantity > 0).length;
  const lowStockCount = produces.filter((p) => p.status === 'LOW_STOCK' || (p.quantity > 0 && p.quantity < 15)).length;
  const outOfStockCount = produces.filter((p) => p.status === 'OUT_OF_STOCK' || p.quantity <= 0).length;

  const totalInventoryWeight = produces.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const potentialInventoryValue = produces.reduce((sum, p) => sum + (p.price * (p.quantity || 0)), 0);

  let realizedRevenue = 0;
  orders.forEach((ord: any) => {
    if (ord.totalAmount) {
      realizedRevenue += Number(ord.totalAmount);
    } else if (Array.isArray(ord.items)) {
      ord.items.forEach((it: any) => {
        realizedRevenue += (Number(it.priceAtOrder) || Number(it.produce?.price) || 0) * (Number(it.quantity) || 1);
      });
    }
  });

  // Group by category
  const categoryMap: { [cat: string]: { count: number; totalQty: number } } = {};
  produces.forEach((p) => {
    const cat = p.category || 'OTHER';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { count: 0, totalQty: 0 };
    }
    categoryMap[cat].count += 1;
    categoryMap[cat].totalQty += p.quantity || 0;
  });

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
          Farm Analytics & Revenue
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Real-time metrics computed directly from your harvest inventory and retail sales.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '12px' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Calculating farm metrics...</p>
        </div>
      ) : (
        <>
          {/* Key Stat Cards */}
          <div className="farmer-kpi-grid">
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Realized Sales Revenue</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', margin: '0.25rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                ₹ {realizedRevenue.toLocaleString('en-IN')}
              </p>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>From {orders.length} retail orders</span>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Inventory Valuation</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                ₹ {potentialInventoryValue.toLocaleString('en-IN')}
              </p>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Estimated value of current stock</span>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Harvest Volume</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0' }}>
                {totalInventoryWeight.toLocaleString('en-IN')} kg
              </p>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Across {totalListings} produce listings</span>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Average Order Size</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', margin: '0.25rem 0 0' }}>
                ₹ {orders.length > 0 ? Math.round(realizedRevenue / orders.length).toLocaleString('en-IN') : 0}
              </p>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Per confirmed retail order</span>
            </div>
          </div>

          {/* 2-Column Analytics Breakdown */}
          <div className="farmer-analytics-grid">
            {/* Inventory Health */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
                Stock Health Distribution
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#15803d', fontWeight: 600 }}>Available & In Stock ({availableCount})</span>
                    <strong style={{ color: '#0f172a' }}>{totalListings > 0 ? Math.round((availableCount / totalListings) * 100) : 0}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${totalListings > 0 ? (availableCount / totalListings) * 100 : 0}%`, height: '100%', backgroundColor: '#10b981' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#b45309', fontWeight: 600 }}>Low Stock Warning ({lowStockCount})</span>
                    <strong style={{ color: '#0f172a' }}>{totalListings > 0 ? Math.round((lowStockCount / totalListings) * 100) : 0}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${totalListings > 0 ? (lowStockCount / totalListings) * 100 : 0}%`, height: '100%', backgroundColor: '#f59e0b' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#b91c1c', fontWeight: 600 }}>Sold Out / Inactive ({outOfStockCount})</span>
                    <strong style={{ color: '#0f172a' }}>{totalListings > 0 ? Math.round((outOfStockCount / totalListings) * 100) : 0}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${totalListings > 0 ? (outOfStockCount / totalListings) * 100 : 0}%`, height: '100%', backgroundColor: '#ef4444' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
                Produces by Category
              </h2>

              {Object.keys(categoryMap).length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No categorized produces yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(categoryMap).map(([cat, data]) => (
                    <div
                      key={cat}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                      }}
                    >
                      <strong style={{ color: '#0f172a' }}>{cat}</strong>
                      <span style={{ color: '#64748b' }}>
                        {data.count} items ({data.totalQty} kg)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </FarmerLayout>
  );
}
