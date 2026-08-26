'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProduceById, Produce } from '../../../lib/api';
import OrderModal from '../../../components/OrderModal';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.productId as string;

  const [produce, setProduce] = useState<Produce | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function loadItem() {
      if (!productId) return;
      setLoading(true);
      try {
        const item = await getProduceById(productId);
        setProduce(item);
        if (item) {
          setOrderQuantity(item.minOrderQuantity || 1);
        }
      } catch (err) {
        console.error('Error fetching produce:', err);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [productId]);

  const fallbackImage =
    'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1000&q=80';

  if (loading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1s infinite linear' }}>
          🌱
        </div>
        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>Loading produce details...</p>
      </div>
    );
  }

  if (!produce) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
          Produce Not Found
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          The requested produce item could not be found or has been archived.
        </p>
        <Link
          href="/catalogue"
          style={{
            display: 'inline-flex',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#10b981',
            color: '#ffffff',
            borderRadius: '10px',
            fontWeight: 700,
          }}
        >
          &larr; Back to Catalogue
        </Link>
      </div>
    );
  }

  const isOutOfStock = produce.status === 'OUT_OF_STOCK' || produce.quantity <= 0;
  const isLowStock = produce.status === 'LOW_STOCK' || (!isOutOfStock && produce.quantity < 50);
  const minQty = produce.minOrderQuantity || 1;
  const maxQty = produce.quantity;
  const subtotal = (orderQuantity * produce.price).toFixed(2);

  const farmerName = produce.farmer?.user?.name || 'Verified Ninjacart Partner Farmer';
  const farmerLocation = produce.farmer?.location || 'Direct Farm Region';
  const farmerBio =
    produce.farmer?.bio ||
    'Dedicated producer practicing sustainable farming and strict post-harvest handling standards.';

  return (
    <div className="main-content">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#64748b',
          marginBottom: '1.5rem',
        }}
      >
        <Link href="/catalogue" style={{ color: '#10b981', fontWeight: 600 }}>
          &larr; Catalogue
        </Link>
        <span>/</span>
        <span style={{ textTransform: 'capitalize' }}>{produce.category.toLowerCase()}</span>
        <span>/</span>
        <span style={{ color: '#0f172a', fontWeight: 700 }}>{produce.name}</span>
      </nav>

      {/* Product Showcase Two-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Image & Farm Assurance */}
        <div>
          {/* Main Image Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '380px', backgroundColor: '#f8fafc' }}>
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

              {/* Category & Status Overlay Badges */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  display: 'flex',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(4px)',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {produce.category}
                </span>

                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
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
                  {isOutOfStock ? 'OUT OF STOCK' : isLowStock ? 'LOW STOCK' : 'IN STOCK & READY'}
                </span>
              </div>
            </div>
          </div>

          {/* Farm Assurance Guarantee */}
          <div
            style={{
              marginTop: '1.5rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '16px',
              padding: '1.25rem',
            }}
          >
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              🌿 Ninjacart Direct Farm Guarantee
            </h4>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: '#15803d',
              }}
            >
              <li>✓ <strong>Farm-gate Harvested:</strong> Picked fresh within 12-24 hours before dispatch</li>
              <li>✓ <strong>Traceable Supply:</strong> 100% direct accountability with origin farm</li>
              <li>✓ <strong>Zero Middlemen:</strong> Maximized returns for farmers, lowest costs for retailers</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Details, Farmer Card, Order Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header & Pricing */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#10b981',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Verified Produce Listing
            </span>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.25,
                margin: '0.25rem 0 1rem',
              }}
            >
              {produce.name}
            </h1>

            {/* Price block */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.75rem',
                backgroundColor: '#f8fafc',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                marginBottom: '1.25rem',
              }}
            >
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#10b981' }}>
                ₹{produce.price.toFixed(2)}
              </span>
              <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>
                per {produce.unit} (Wholesale)
              </span>
            </div>

            {/* Produce Specifications */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Available Inventory</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {produce.quantity} {produce.unit}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Minimum Order Quantity</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {produce.minOrderQuantity || 1} {produce.unit}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                About this produce
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6 }}>
                {produce.description ||
                  'Premium grade fresh agricultural produce harvested following strict quality parameters for retail freshness and shelf-life.'}
              </p>
            </div>
          </div>

          {/* Farmer Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  flexShrink: 0,
                  border: '2px solid #a7f3d0',
                }}
              >
                👨‍🌾
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                  Supplying Farmer
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{farmerName}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>📍 {farmerLocation}</p>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, fontStyle: 'italic' }}>
              &ldquo;{farmerBio}&rdquo;
            </p>
          </div>

          {/* Direct Order Widget */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '2px solid #10b981',
              padding: '1.75rem',
              boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.1)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              Wholesale Order Placement
            </h3>

            {isOutOfStock ? (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#b91c1c',
                  fontWeight: 600,
                }}
              >
                ⚠️ This item is currently out of stock. Please check back after next harvest.
              </div>
            ) : (
              <div>
                {/* Quantity Stepper */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Select Quantity ({produce.unit})
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setOrderQuantity((q) => Math.max(minQty, q - (minQty > 5 ? 5 : 1)))}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        color: '#334155',
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={minQty}
                      max={maxQty}
                      value={orderQuantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setOrderQuantity(isNaN(val) ? minQty : val);
                      }}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: '0.7rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: '#0f172a',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setOrderQuantity((q) => Math.min(maxQty, q + (minQty > 5 ? 5 : 1)))}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        color: '#334155',
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: '#64748b',
                      marginTop: '0.4rem',
                    }}
                  >
                    <span>Min Order: {minQty} {produce.unit}</span>
                    <span>Max Available: {maxQty} {produce.unit}</span>
                  </div>
                </div>

                {/* Subtotal preview */}
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600, display: 'block' }}>
                      Calculated Wholesale Total
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#047857' }}>
                      {orderQuantity} {produce.unit} &times; ₹{produce.price.toFixed(2)}
                    </span>
                  </div>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#065f46' }}>
                    ₹{subtotal}
                  </span>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(true)}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: '12px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.35)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  🛒 Place Wholesale Order Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <OrderModal
        produce={produce}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </div>
  );
}
