'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProduceById, Produce } from '@/lib/api';
import OrderModal from '@/components/OrderModal';
import { useAuth } from '@/context/AuthContext';

const fallbackImage = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1000&q=80';
const panelStyle = { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' };

export default function ProductDetailPage() {
  const { role, user } = useAuth();
  const isFarmer = (role || user?.role) === 'FARMER';

  const params = useParams();
  const productId = params?.productId as string;
  const [produce, setProduce] = useState<Produce | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(0);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function loadItem() {
      if (!productId) return;
      setLoading(true);
      setErrorMessage(null);
      try {
        const item = await getProduceById(productId);
        if (item?.status === 'ARCHIVED') {
          setErrorMessage('This produce listing is no longer available.');
          setProduce(null);
          return;
        }
        setProduce(item);
        if (item) {
          const minQty = item.minOrderQuantity || 1;
          setOrderQuantity(item.quantity >= minQty ? minQty : 0);
        }
      } catch (error) {
        console.error('Error fetching produce:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load this produce listing.');
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [productId]);

  if (loading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div
          style={{
            display: 'inline-block',
            width: '44px',
            height: '44px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Loading produce details...</p>
      </div>
    );
  }

  if (!produce) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ color: '#0f172a', marginBottom: '0.75rem', fontSize: '1.75rem' }}>Produce Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          {errorMessage || 'The requested produce item could not be found or has been archived.'}
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
  const isQuantityValid = orderQuantity >= minQty && orderQuantity <= maxQty;
  const subtotal = (orderQuantity * produce.price).toFixed(2);
  const farmerName = produce.farmer?.user?.name || 'Verified Ninjacart Partner Farmer';
  const farmerLocation = produce.farmer?.location || 'Direct Farm Region';
  const farmerBio = produce.farmer?.bio || 'Dedicated producer practicing sustainable farming and strict post-harvest handling standards.';
  const updateQuantity = (value: number) => setOrderQuantity(Math.min(maxQty, Math.max(0, value)));

  return (
    <div className="main-content">
      <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: '0.5rem', color: '#64748b', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <Link href="/catalogue" style={{ color: '#10b981', fontWeight: 600 }}>&larr; Catalogue</Link>
        <span>/</span>
        <span>{produce.category}</span>
        <span>/</span>
        <strong style={{ color: '#0f172a' }}>{produce.name}</strong>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        <div>
          <div style={{ ...panelStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '380px', backgroundColor: '#f8fafc' }}>
              <img
                src={!imgError && produce.imageUrl ? produce.imageUrl : fallbackImage}
                alt={produce.name}
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.95)', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  {produce.category}
                </span>
                <span
                  style={{
                    backgroundColor: isOutOfStock ? '#fee2e2' : isLowStock ? '#fef3c7' : '#dcfce7',
                    color: isOutOfStock ? '#b91c1c' : isLowStock ? '#b45309' : '#15803d',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  {isOutOfStock ? 'OUT OF STOCK' : isLowStock ? 'LOW STOCK' : 'IN STOCK & READY'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ ...panelStyle, marginTop: '1.5rem', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <h4 style={{ color: '#166534', marginBottom: '0.75rem', fontWeight: 700 }}>🌿 Ninjacart Direct Farm Guarantee</h4>
            <p style={{ color: '#15803d', fontSize: '0.875rem', lineHeight: 1.6 }}>
              ✓ Farm-gate Harvested: Picked fresh before dispatch<br />
              ✓ Traceable Supply: Direct accountability with origin farm<br />
              ✓ Zero Middlemen: Maximized value for farmers and retailers
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section style={panelStyle}>
            <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Verified Produce Listing
            </span>
            <h1 style={{ fontSize: '2rem', color: '#0f172a', margin: '0.25rem 0 1rem', fontWeight: 800 }}>
              {produce.name}
            </h1>
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid #f1f5f9' }}>
              <strong style={{ color: '#10b981', fontSize: '2rem', fontWeight: 800 }}>₹{produce.price.toFixed(2)}</strong>
              <span style={{ color: '#64748b', fontWeight: 500 }}> per {produce.unit} (Wholesale)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <small style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Available Inventory</small><br />
                <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>{produce.quantity} {produce.unit}</strong>
              </div>
              <div>
                <small style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Minimum Order Quantity</small><br />
                <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>{minQty} {produce.unit}</strong>
              </div>
            </div>
            <h3 style={{ fontSize: '0.95rem', color: '#334155', fontWeight: 700, marginBottom: '0.35rem' }}>About this produce</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.925rem' }}>
              {produce.description || 'Premium grade fresh agricultural produce harvested following strict quality parameters for retail freshness and shelf-life.'}
            </p>
          </section>

          <section style={panelStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'grid', placeItems: 'center', fontSize: '1.5rem' }}>
                👨‍🌾
              </div>
              <div>
                <small style={{ color: '#059669', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>VERIFIED FARMER</small>
                <h3 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>{farmerName}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>📍 {farmerLocation}</p>
              </div>
            </div>
            <p style={{ color: '#475569', fontStyle: 'italic', fontSize: '0.9rem', lineHeight: 1.5 }}>
              &ldquo;{farmerBio}&rdquo;
            </p>
          </section>

          <section style={{ ...panelStyle, border: '2px solid #10b981' }}>
            <h3 style={{ color: '#0f172a', marginBottom: '1rem', fontSize: '1.15rem', fontWeight: 700 }}>
              {isFarmer ? 'Produce Wholesale Information' : 'Wholesale Order Placement'}
            </h3>
            {isOutOfStock ? (
              <p style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '10px', textAlign: 'center', fontWeight: 600 }}>
                This item is currently out of stock.
              </p>
            ) : isFarmer ? (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.25rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>👨‍🌾</div>
                <h4 style={{ color: '#166534', fontWeight: 700, marginBottom: '0.35rem' }}>Farmer Market View</h4>
                <p style={{ color: '#15803d', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Wholesale purchasing on Ninjacart is reserved for verified Retailers. You are viewing this listing at live market rates.
                </p>
                <Link
                  href="/farmer/dashboard"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.25rem',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                  }}
                >
                  Manage My Produce Listings →
                </Link>
              </div>
            ) : (
              <>
                <label htmlFor="detail-quantity" style={{ display: 'block', color: '#334155', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Select Quantity ({produce.unit})
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(orderQuantity - (minQty > 5 ? 5 : 1))}
                    disabled={orderQuantity <= 0}
                    aria-label="Decrease quantity"
                    style={{ width: '44px', height: '44px', border: '1px solid #cbd5e1', borderRadius: '10px', backgroundColor: '#ffffff', fontSize: '1.3rem', cursor: orderQuantity <= 0 ? 'not-allowed' : 'pointer' }}
                  >
                    -
                  </button>
                  <input
                    id="detail-quantity"
                    type="number"
                    min="0"
                    max={maxQty}
                    value={orderQuantity}
                    onChange={(event) => updateQuantity(Number(event.target.value) || 0)}
                    aria-label="Quantity to order"
                    style={{ flex: 1, textAlign: 'center', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: 800, fontSize: '1.1rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => updateQuantity(orderQuantity + (minQty > 5 ? 5 : 1))}
                    disabled={orderQuantity >= maxQty}
                    aria-label="Increase quantity"
                    style={{ width: '44px', height: '44px', border: '1px solid #cbd5e1', borderRadius: '10px', backgroundColor: '#ffffff', fontSize: '1.3rem', cursor: orderQuantity >= maxQty ? 'not-allowed' : 'pointer' }}
                  >
                    +
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem', margin: '0.4rem 0 1.25rem' }}>
                  <span>Min Order: {minQty} {produce.unit}</span>
                  <span>Max Available: {maxQty} {produce.unit}</span>
                </div>
                <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', border: '1px solid #a7f3d0' }}>
                  <span style={{ color: '#065f46', fontSize: '0.9rem' }}>
                    Wholesale Subtotal<br />
                    <small>{orderQuantity} {produce.unit} &times; ₹{produce.price.toFixed(2)}</small>
                  </span>
                  <strong style={{ color: '#065f46', fontSize: '1.5rem', fontWeight: 800 }}>₹{subtotal}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(true)}
                  disabled={!isQuantityValid}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: '12px',
                    backgroundColor: isQuantityValid ? '#10b981' : '#94a3b8',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: isQuantityValid ? 'pointer' : 'not-allowed',
                    border: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: isQuantityValid ? '0 2px 6px rgba(16, 185, 129, 0.3)' : 'none',
                  }}
                >
                  🛒 Place Wholesale Order Now
                </button>
              </>
            )}
          </section>
        </div>
      </div>
      {!isFarmer && (
        <OrderModal
          produce={produce}
          product={produce}
          quantity={orderQuantity}
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          onConfirmSuccess={() => setOrderQuantity(0)}
        />
      )}
    </div>
  );
}
