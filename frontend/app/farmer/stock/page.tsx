'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import FarmerLayout from '@/components/FarmerLayout';
import { getProduces, updateProduct, Produce } from '@/lib/api';

export default function FarmerStockPage() {
  const [produces, setProduces] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editValues, setEditValues] = useState<{ [id: string]: { quantity: number; price: number; minOrderQuantity: number } }>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProduces({
        status: 'ALL',
        search: search.trim() || undefined,
        limit: 100,
      });
      const items = res?.produces || [];
      setProduces(items);

      const initialEdits: { [id: string]: { quantity: number; price: number; minOrderQuantity: number } } = {};
      items.forEach((p) => {
        initialEdits[p.id] = {
          quantity: p.quantity,
          price: p.price,
          minOrderQuantity: p.minOrderQuantity || 1,
        };
      });
      setEditValues(initialEdits);
    } catch (err) {
      console.error('Failed to fetch stock:', err);
      setError('Unable to load stock from server.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const handleInputChange = (id: string, field: 'quantity' | 'price' | 'minOrderQuantity', val: number) => {
    setEditValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: val,
      },
    }));
  };

  const handleSaveItem = async (prod: Produce) => {
    const edits = editValues[prod.id];
    if (!edits) return;

    setSavingId(prod.id);
    setSuccessMsg(null);
    try {
      const updatedStatus = edits.quantity <= 0 ? 'OUT_OF_STOCK' : (edits.quantity < 15 ? 'LOW_STOCK' : 'AVAILABLE');
      await updateProduct(prod.id, {
        quantity: edits.quantity,
        price: edits.price,
        minOrderQuantity: edits.minOrderQuantity,
        status: updatedStatus,
      });
      setSuccessMsg(`Updated "${prod.name}" successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchStock();
    } catch (err: any) {
      alert(err?.message || 'Failed to update stock');
    } finally {
      setSavingId(null);
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
          Manage Stock & Pricing
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Quickly adjust inventory levels, prices, and minimum order quantities directly in real time.
        </p>
      </div>

      {successMsg && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="🔍 Search produce inventory..."
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
      </div>

      {/* Stock Table */}
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
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>Loading inventory from server...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#dc2626' }}>
            <p>{error}</p>
            <button
              onClick={fetchStock}
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
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📦</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              No inventory records found
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Add produce to start tracking and updating stock levels.
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
              Add Produce Listing
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Produce</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Stock (Quantity)</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Price (₹)</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Min Order Qty</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Save</th>
                </tr>
              </thead>
              <tbody>
                {produces.map((prod) => {
                  const currentEdits = editValues[prod.id] || {
                    quantity: prod.quantity,
                    price: prod.price,
                    minOrderQuantity: prod.minOrderQuantity || 1,
                  };
                  const isSaving = savingId === prod.id;
                  const isChanged =
                    currentEdits.quantity !== prod.quantity ||
                    currentEdits.price !== prod.price ||
                    currentEdits.minOrderQuantity !== (prod.minOrderQuantity || 1);

                  return (
                    <tr
                      key={prod.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isChanged ? '#f0fdf4' : 'transparent',
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
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
                            <strong style={{ display: 'block', fontSize: '0.925rem', color: '#0f172a' }}>
                              {prod.name}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Unit: {prod.unit || 'kg'}</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={currentEdits.quantity}
                            onChange={(e) => handleInputChange(prod.id, 'quantity', parseFloat(e.target.value) || 0)}
                            style={{
                              width: '100px',
                              padding: '0.45rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              outline: 'none',
                            }}
                          />
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{prod.unit || 'kg'}</span>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: '#10b981' }}>₹</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={currentEdits.price}
                            onChange={(e) => handleInputChange(prod.id, 'price', parseFloat(e.target.value) || 0)}
                            style={{
                              width: '100px',
                              padding: '0.45rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              outline: 'none',
                            }}
                          />
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={currentEdits.minOrderQuantity}
                          onChange={(e) => handleInputChange(prod.id, 'minOrderQuantity', parseFloat(e.target.value) || 1)}
                          style={{
                            width: '80px',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.9rem',
                            outline: 'none',
                          }}
                        />
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleSaveItem(prod)}
                          disabled={isSaving || !isChanged}
                          style={{
                            padding: '0.45rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isSaving ? '#94a3b8' : isChanged ? '#10b981' : '#e2e8f0',
                            color: isChanged ? '#ffffff' : '#64748b',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: isSaving || !isChanged ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
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
