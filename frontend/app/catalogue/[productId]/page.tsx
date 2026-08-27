'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProduceById, Produce } from '@/lib/api';
import OrderModal from '@/components/OrderModal';

const fallbackImage = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1000&q=80';
const panelStyle = { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' };

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.productId as string;
  const [produce, setProduce] = useState<Produce | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderQuantity, setOrderQuantity] = useState(0);
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
          const minQty = item.minOrderQuantity || 1;
          setOrderQuantity(item.quantity >= minQty ? minQty : 0);
        }
      } catch (error) {
        console.error('Error fetching produce:', error);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [productId]);

  if (loading) return <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}><p style={{ color: '#64748b', fontWeight: 600 }}>Loading produce details...</p></div>;
  if (!produce) return <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}><h2 style={{ color: '#0f172a', marginBottom: '0.75rem' }}>Produce Not Found</h2><p style={{ color: '#64748b', marginBottom: '1.5rem' }}>The requested produce item could not be found or has been archived.</p><Link href="/catalogue" style={{ display: 'inline-flex', padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: '#ffffff', borderRadius: '10px', fontWeight: 700 }}>&larr; Back to Catalogue</Link></div>;

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
      <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: '0.5rem', color: '#64748b', marginBottom: '1.5rem', fontSize: '0.875rem' }}><Link href="/catalogue" style={{ color: '#10b981', fontWeight: 600 }}>&larr; Catalogue</Link><span>/</span><span>{produce.category}</span><span>/</span><strong style={{ color: '#0f172a' }}>{produce.name}</strong></nav>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        <div>
          <div style={{ ...panelStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '380px', backgroundColor: '#f8fafc' }}><img src={!imgError && produce.imageUrl ? produce.imageUrl : fallbackImage} alt={produce.name} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /><div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}><span style={{ backgroundColor: 'rgba(255,255,255,0.95)', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>{produce.category}</span><span style={{ backgroundColor: isOutOfStock ? '#fee2e2' : isLowStock ? '#fef3c7' : '#dcfce7', color: isOutOfStock ? '#b91c1c' : isLowStock ? '#b45309' : '#15803d', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>{isOutOfStock ? 'OUT OF STOCK' : isLowStock ? 'LOW STOCK' : 'IN STOCK & READY'}</span></div></div>
          </div>
          <div style={{ ...panelStyle, marginTop: '1.5rem', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}><h4 style={{ color: '#166534', marginBottom: '0.75rem' }}>🌿 Ninjacart Direct Farm Guarantee</h4><p style={{ color: '#15803d', fontSize: '0.875rem', lineHeight: 1.6 }}>✓ Farm-gate Harvested: Picked fresh before dispatch<br />✓ Traceable Supply: Direct accountability with origin farm<br />✓ Zero Middlemen: Maximized value for farmers and retailers</p></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section style={panelStyle}><span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Verified Produce Listing</span><h1 style={{ fontSize: '2rem', color: '#0f172a', margin: '0.25rem 0 1rem' }}>{produce.name}</h1><div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}><strong style={{ color: '#10b981', fontSize: '2rem' }}>₹{produce.price.toFixed(2)}</strong><span style={{ color: '#64748b' }}> per {produce.unit} (Wholesale)</span></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}><div><small style={{ color: '#64748b' }}>Available Inventory</small><br /><strong>{produce.quantity} {produce.unit}</strong></div><div><small style={{ color: '#64748b' }}>Minimum Order Quantity</small><br /><strong>{minQty} {produce.unit}</strong></div></div><h3 style={{ fontSize: '0.95rem', color: '#334155' }}>About this produce</h3><p style={{ color: '#64748b', lineHeight: 1.6 }}>{produce.description || 'Premium grade fresh agricultural produce harvested following strict quality parameters for retail freshness and shelf-life.'}</p></section>
          <section style={panelStyle}><div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}><div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'grid', placeItems: 'center', fontSize: '1.5rem' }}>👨‍🌾</div><div><small style={{ color: '#059669', fontWeight: 700 }}>VERIFIED FARMER</small><h3 style={{ color: '#0f172a' }}>{farmerName}</h3><p style={{ color: '#64748b', fontSize: '0.85rem' }}>📍 {farmerLocation}</p></div></div><p style={{ color: '#475569', fontStyle: 'italic' }}>&ldquo;{farmerBio}&rdquo;</p></section>
          <section style={{ ...panelStyle, border: '2px solid #10b981' }}><h3 style={{ color: '#0f172a', marginBottom: '1rem' }}>Wholesale Order Placement</h3>{isOutOfStock ? <p style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>This item is currently out of stock.</p> : <><label htmlFor="detail-quantity" style={{ display: 'block', color: '#334155', fontWeight: 600, marginBottom: '0.5rem' }}>Select Quantity ({produce.unit})</label><div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><button type="button" onClick={() => updateQuantity(orderQuantity - (minQty > 5 ? 5 : 1))} disabled={orderQuantity <= 0} aria-label="Decrease quantity" style={{ width: '44px', height: '44px', border: '1px solid #cbd5e1', borderRadius: '10px', backgroundColor: '#ffffff', fontSize: '1.3rem' }}>-</button><input id="detail-quantity" type="number" min="0" max={maxQty} value={orderQuantity} onChange={(event) => updateQuantity(Number(event.target.value) || 0)} aria-label="Quantity to order" style={{ flex: 1, textAlign: 'center', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: 800 }} /><button type="button" onClick={() => updateQuantity(orderQuantity + (minQty > 5 ? 5 : 1))} disabled={orderQuantity >= maxQty} aria-label="Increase quantity" style={{ width: '44px', height: '44px', border: '1px solid #cbd5e1', borderRadius: '10px', backgroundColor: '#ffffff', fontSize: '1.3rem' }}>+</button></div><div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem', margin: '0.4rem 0 1.25rem' }}><span>Min Order: {minQty} {produce.unit}</span><span>Max Available: {maxQty} {produce.unit}</span></div><div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}><span style={{ color: '#065f46' }}>Wholesale Subtotal<br /><small>{orderQuantity} {produce.unit} &times; ₹{produce.price.toFixed(2)}</small></span><strong style={{ color: '#065f46', fontSize: '1.5rem' }}>₹{subtotal}</strong></div><button type="button" onClick={() => setIsOrderModalOpen(true)} disabled={!isQuantityValid} style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', backgroundColor: isQuantityValid ? '#10b981' : '#94a3b8', color: '#ffffff', fontWeight: 700, cursor: isQuantityValid ? 'pointer' : 'not-allowed' }}>🛒 Place Wholesale Order Now</button></>}</section>
        </div>
      </div>
      <OrderModal product={produce} quantity={orderQuantity} isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} onConfirmSuccess={() => setOrderQuantity(0)} />
    </div>
  );
}
