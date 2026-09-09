"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Produce } from "../lib/api";

interface ProductCardProps {
  produce: Produce;
  onOrderClick?: (produce: Produce) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  produce,
  onOrderClick,
}) => {
  const [imgError, setImgError] = useState(false);

  const isAvailable =
    (produce.status === "AVAILABLE" || produce.status === "LOW_STOCK") && produce.quantity > 0;

  const isLowStock =
    produce.status === "LOW_STOCK" ||
    (isAvailable && produce.quantity <= 5);

  const fallbackImage =
    "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80";

  const imageUrl =
    !imgError && produce.imageUrl
      ? produce.imageUrl
      : fallbackImage;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Product Image */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '65%', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
        <img
          src={imageUrl}
          alt={produce.name}
          onError={() => setImgError(true)}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Card Content */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Product Title */}
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: 600, 
          color: '#1e293b',
          marginBottom: '0.25rem',
        }}>
          {produce.name}
        </h3>

        {/* Pricing */}
        <div style={{ marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
            ₹{produce.price.toFixed(2)}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {" "} / {produce.unit || "kg"}
          </span>
        </div>

        {/* Stock Status & Quantity */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 500,
            color: !isAvailable ? '#dc2626' : isLowStock ? '#d97706' : '#16a34a',
          }}>
            {!isAvailable ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {isAvailable ? `${produce.quantity} ${produce.unit || "kg"} available` : "Check back later"}
          </span>
        </div>

        {/* Add to Cart Button */}
        <div style={{ marginTop: 'auto' }}>
          <button
            type="button"
            disabled={!isAvailable}
            onClick={() => isAvailable && onOrderClick && onOrderClick(produce)}
            style={{
              width: '100%',
              padding: '0.65rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              backgroundColor: '#ffffff',
              color: isAvailable ? '#16a34a' : '#94a3b8',
              border: isAvailable ? '1px solid #16a34a' : '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: isAvailable ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (isAvailable) {
                e.currentTarget.style.backgroundColor = '#f0fdf4';
              }
            }}
            onMouseLeave={(e) => {
              if (isAvailable) {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;