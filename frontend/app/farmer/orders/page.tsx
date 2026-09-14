'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import FarmerLayout from '@/components/FarmerLayout';
import { getOrders, updateOrderStatus } from '@/lib/api';

const ORDER_STATUS_OPTIONS = [
  { value: 'CONFIRMED', label: 'Confirmed', color: '#2563eb', bg: '#eff6ff' },
  { value: 'PROCESSING', label: 'Processing', color: '#d97706', bg: '#fef3c7' },
  { value: 'SHIPPED', label: 'Shipped / Dispatched', color: '#7c3aed', bg: '#f5f3ff' },
  { value: 'DELIVERED', label: 'Delivered', color: '#16a34a', bg: '#dcfce7' },
  { value: 'CANCELLED', label: 'Cancelled / Rejected', color: '#dc2626', bg: '#fee2e2' },
];

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch farmer orders:', err);
      setError('Unable to load orders from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update locally
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ACTIVE') return ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED';
    return ord.status === filterStatus;
  });

  return (
    <FarmerLayout>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
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
            Incoming Retail Orders
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Manage and update order fulfillment status for retail buyers.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span>🔄</span>
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {[
          { key: 'ALL', label: `All (${orders.length})` },
          { key: 'ACTIVE', label: `Active (${orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length})` },
          { key: 'SHIPPED', label: `Shipped (${orders.filter((o) => o.status === 'SHIPPED').length})` },
          { key: 'DELIVERED', label: `Delivered (${orders.filter((o) => o.status === 'DELIVERED').length})` },
          { key: 'CANCELLED', label: `Cancelled (${orders.filter((o) => o.status === 'CANCELLED').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              backgroundColor: filterStatus === tab.key ? '#0f172a' : '#ffffff',
              color: filterStatus === tab.key ? '#ffffff' : '#64748b',
              cursor: 'pointer',
              borderStyle: 'solid',
              borderWidth: '1px',
              borderColor: filterStatus === tab.key ? '#0f172a' : '#e2e8f0',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
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
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>Loading orders from server...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#dc2626' }}>
            <p>{error}</p>
            <button
              onClick={fetchOrders}
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
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📦</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              No orders found
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              {filterStatus === 'ALL'
                ? "When grocery chains and retail stores place orders for your produce, their orders will be listed here."
                : `No orders currently matching the "${filterStatus}" filter.`}
            </p>
            <Link
              href="/farmer/listings"
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
              View My Produce Listings
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredOrders.map((order) => {
              const retailerName =
                order.retailer?.storeName || order.retailer?.user?.name || 'Retail Store';
              const retailerEmail = order.retailer?.user?.email || '';
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              let total = 0;
              if (order.totalAmount) {
                total = Number(order.totalAmount);
              } else if (Array.isArray(order.items)) {
                total = order.items.reduce(
                  (sum: number, it: any) =>
                    sum + (Number(it.priceAtOrder) || Number(it.produce?.price) || 0) * (Number(it.quantity) || 1),
                  0
                );
              }

              const currentStatus = order.status || 'CONFIRMED';
              const statusMeta =
                ORDER_STATUS_OPTIONS.find((s) => s.value === currentStatus) || ORDER_STATUS_OPTIONS[0];
              const isUpdating = updatingId === order.id;

              return (
                <div
                  key={order.id}
                  style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {/* Top Bar with Order ID & Status Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          color: '#0f172a',
                          fontFamily: 'monospace',
                        }}
                      >
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.75rem' }}>
                        {orderDate}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '1.15rem', color: '#10b981' }}>
                        ₹{total.toLocaleString('en-IN')}
                      </strong>

                      {/* Status Selector Dropdown */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label
                          htmlFor={`status-select-${order.id}`}
                          style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}
                        >
                          Status:
                        </label>
                        <select
                          id={`status-select-${order.id}`}
                          value={currentStatus}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            backgroundColor: statusMeta.bg,
                            color: statusMeta.color,
                            border: `1px solid ${statusMeta.color}40`,
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED (Reject)</option>
                        </select>
                        {isUpdating && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Saving...</span>}
                      </div>
                    </div>
                  </div>

                  {/* Buyer & Delivery Info */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      backgroundColor: '#f8fafc',
                      padding: '1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>
                        Buyer / Retailer
                      </span>
                      <strong style={{ color: '#0f172a' }}>{retailerName}</strong>
                      {retailerEmail && (
                        <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '2px 0 0' }}>{retailerEmail}</p>
                      )}
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>
                        Delivery Address
                      </span>
                      <p style={{ color: '#334155', margin: 0 }}>
                        {order.deliveryAddress || 'Direct Store Delivery'}
                      </p>
                    </div>

                    {order.notes && (
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>
                          Special Notes
                        </span>
                        <p style={{ color: '#334155', margin: 0 }}>{order.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Ordered Produce Items */}
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Ordered Produce
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {order.items?.map((item: any) => (
                        <div
                          key={item.id || item.produceId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0.75rem',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                          }}
                        >
                          <div>
                            <strong style={{ color: '#0f172a' }}>
                              {item.produce?.name || 'Produce Item'}
                            </strong>
                            <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>
                              ({item.quantity} {item.produce?.unit || 'kg'} @ ₹{item.priceAtOrder || item.produce?.price || 0}/{item.produce?.unit || 'kg'})
                            </span>
                          </div>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            ₹{((item.priceAtOrder || item.produce?.price || 0) * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FarmerLayout>
  );
}
