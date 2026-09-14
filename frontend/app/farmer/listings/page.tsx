'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import FarmerLayout from '@/components/FarmerLayout';
import { getProduces, deleteProduct, updateProduct, Produce, ProduceStatus } from '@/lib/api';

export default function FarmerListingsPage() {
  const [produces, setProduces] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProduces({
        category: category !== 'ALL' ? category : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : 'ALL',
        search: search.trim() || undefined,
        limit: 100,
      });
      setProduces(res?.produces || []);
    } catch (err) {
      console.error('Failed to fetch farmer listings:', err);
      setError('Unable to load produce listings from server.');
    } finally {
      setLoading(false);
    }
  }, [category, statusFilter, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchListings();
    }, 250);
    return () => clearTimeout(debounce);
  }, [fetchListings]);

  const handleStatusToggle = async (item: Produce) => {
    setActionLoadingId(item.id);
    try {
      const nextStatus: ProduceStatus =
        item.status === 'AVAILABLE' ? 'OUT_OF_STOCK' : 'AVAILABLE';
      await updateProduct(item.id, {
        status: nextStatus,
        quantity: nextStatus === 'OUT_OF_STOCK' ? 0 : (item.quantity > 0 ? item.quantity : 10),
      });
      await fetchListings();
    } catch (err: any) {
      alert(err?.message || 'Failed to update produce status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from your listings?`)) {
      return;
    }
    setActionLoadingId(id);
    try {
      await deleteProduct(id);
      await fetchListings();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete listing');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <FarmerLayout>
      {/* Header Section */}
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
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              marginBottom: '0.25rem',
            }}
          >
            My Produce Listings
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Manage harvest inventory, catalogue visibility, and product pricing.
          </p>
        </div>

        <Link
          href="/farmer/add-produce"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            backgroundColor: '#10b981',
            color: '#ffffff',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
            transition: 'background-color 0.2s ease',
          }}
        >
          <span>🌱</span>
          <span>Add New Produce</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: '1 1 250px', minWidth: '200px' }}>
          <input
            type="text"
            placeholder="🔍 Search produces by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="VEGETABLES">Vegetables</option>
            <option value="FRUITS">Fruits</option>
            <option value="GRAINS">Grains</option>
            <option value="TUBERS">Tubers</option>
            <option value="HERBS">Herbs</option>
            <option value="DAIRY">Dairy</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Listings Table / Cards */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>Loading listings from server...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#dc2626' }}>
            <p>{error}</p>
            <button
              onClick={fetchListings}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        ) : produces.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🌱</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              No produce listings found
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              You haven't listed any produce matching these filters yet. Start selling directly to retailers by adding your harvest.
            </p>
            <Link
              href="/farmer/add-produce"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                backgroundColor: '#10b981',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              Add First Produce Listing
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Produce</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Price</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Available Stock</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {produces.map((prod) => {
                  const isActionLoading = actionLoadingId === prod.id;
                  return (
                    <tr
                      key={prod.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '8px',
                              backgroundColor: '#f1f5f9',
                              overflow: 'hidden',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {prod.imageUrl ? (
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{ fontSize: '1.25rem' }}>🥗</span>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/catalogue/${prod.id}`}
                              style={{
                                fontWeight: 700,
                                fontSize: '0.925rem',
                                color: '#0f172a',
                                textDecoration: 'none',
                              }}
                            >
                              {prod.name}
                            </Link>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                              Min Order: {prod.minOrderQuantity || 1} {prod.unit || 'kg'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                          }}
                        >
                          {prod.category}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, fontSize: '0.925rem', color: '#10b981' }}>
                        ₹{prod.price} / {prod.unit || 'kg'}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontWeight: 700, color: prod.quantity <= 0 ? '#dc2626' : '#0f172a' }}>
                          {prod.quantity} {prod.unit || 'kg'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '9999px',
                            backgroundColor:
                              prod.status === 'AVAILABLE' && prod.quantity > 0
                                ? '#dcfce7'
                                : prod.status === 'LOW_STOCK'
                                ? '#fef3c7'
                                : '#fee2e2',
                            color:
                              prod.status === 'AVAILABLE' && prod.quantity > 0
                                ? '#15803d'
                                : prod.status === 'LOW_STOCK'
                                ? '#b45309'
                                : '#b91c1c',
                          }}
                        >
                          {prod.quantity <= 0 ? 'OUT_OF_STOCK' : prod.status}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            onClick={() => handleStatusToggle(prod)}
                            disabled={isActionLoading}
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              cursor: isActionLoading ? 'not-allowed' : 'pointer',
                              color: '#334155',
                            }}
                          >
                            {prod.status === 'AVAILABLE' ? 'Mark Sold Out' : 'Mark Available'}
                          </button>

                          <Link
                            href="/farmer/stock"
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#2563eb',
                              borderRadius: '6px',
                              textDecoration: 'none',
                            }}
                          >
                            Stock
                          </Link>

                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            disabled={isActionLoading}
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              borderRadius: '6px',
                              cursor: isActionLoading ? 'not-allowed' : 'pointer',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FarmerLayout>
  );
}
