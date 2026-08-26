'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Produce } from '../lib/api';

interface ProductCardProps {
  produce: Produce;
  onOrderClick?: (produce: Produce) => void;
}

export default function ProductCard({ produce, onOrderClick }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  const fallbackImage =
    'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80';

  const isOutOfStock = produce.status === 'OUT_OF_STOCK' || produce.quantity <= 0;
  const isLowStock = produce.status === 'LOW_STOCK' || (!isOutOfStock && produce.quantity < 50);

  const farmerName = produce.farmer?.user?.name || 'Verified Partner Farm';
  const farmerLocation = produce.farmer?.location || 'Direct Farm Source';

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow =
          '0 12px 20px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.borderColor = '#cbd5e1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow =
          '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      {/* Image Container with Badges */}
      <div style={{ position: 'relative', width: '100%', height: '190px', backgroundColor: '#f1f5f9' }}>
        <img
          src={!imgError && produce.imageUrl ? produce.imageUrl : fallbackImage}
          alt={produce.name}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        {/* Category Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#334155',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {produce.category}
        </div>

        {/* Status Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            backgroundColor: isOutOfStock
              ? '#fee2e2'
              : isLowStock
              ? '#fef3c7'
              : '#dcfce7',
            color: isOutOfStock
              ? '#b91c1c'
              : isLowStock
              ? '#b45309'
              : '#15803d',
          }}
        >
          {isOutOfStock ? 'OUT OF STOCK' : isLowStock ? 'LOW STOCK' : 'AVAILABLE'}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.85rem' }}>
        {/* Title */}
        <div>
          <Link
            href={`/catalogue/${produce.id}`}
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#0f172a',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textDecoration: 'none',
            }}
          >
            {produce.name}
          </Link>
        </div>

        {/* Farmer Information */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#f8fafc',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              flexShrink: 0,
            }}
          >
            🚜
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#1e293b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {farmerName}
            </p>
            <p
              style={{
                fontSize: '0.72rem',
                color: '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              📍 {farmerLocation}
            </p>
          </div>
        </div>

        {/* Pricing & Stock Details */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.5rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Wholesale Price</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              ₹{produce.price.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
              {' '}/ {produce.unit}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Stock Available</span>
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: isOutOfStock ? '#ef4444' : '#334155',
              }}
            >
              {produce.quantity} {produce.unit}
            </span>
          </div>
        </div>

        {/* Min order note */}
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '-0.3rem' }}>
          Min order: {produce.minOrderQuantity || 1} {produce.unit}
        </div>

        {/* Card Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <Link
            href={`/catalogue/${produce.id}`}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '0.6rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'background-color 0.2s',
            }}
          >
            View Details
          </Link>

          {onOrderClick && !isOutOfStock && (
            <button
              type="button"
              onClick={() => onOrderClick(produce)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'background-color 0.2s',
              }}
            >
              <span>🛒</span> Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
