'use client';

import React, { useEffect, useState } from 'react';
import { createOrder, Product, Produce } from '@/lib/api';

interface OrderModalProps {
  product?: Product;
  quantity?: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSuccess?: (orderData: any) => void;
  produce?: Produce | null;
}

const fieldStyle = { width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'inherit' };

export default function OrderModal({ product, quantity: initialQuantity = 1, isOpen, onClose, onConfirmSuccess, produce: catalogueProduce }: OrderModalProps) {
  const currentProduct = product || catalogueProduce;
  const [quantity, setQuantity] = useState(initialQuantity);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (currentProduct) {
      const minQty = currentProduct.minOrderQuantity || 1;
      const startingQuantity = catalogueProduce ? minQty : initialQuantity;
      setQuantity(Math.min(currentProduct.quantity, Math.max(0, startingQuantity)));
      setShowSuccess(false);
      setError(null);
    }
  }, [catalogueProduce, currentProduct, initialQuantity]);

  if (!isOpen || !currentProduct) return null;

  const minQty = currentProduct.minOrderQuantity || 1;
  const maxQty = currentProduct.quantity;
  const isQuantityValid = quantity >= minQty && quantity <= maxQty;
  const totalPrice = (currentProduct.price * quantity).toFixed(2);
  const updateQuantity = (value: number) => setQuantity(Math.min(maxQty, Math.max(0, value)));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isQuantityValid) {
      setError(`Quantity must be between ${minQty} and ${maxQty} ${currentProduct.unit}.`);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await createOrder({
        items: [{ produceId: currentProduct.id, quantity }],
        deliveryAddress: deliveryAddress.trim(),
        notes: notes.trim() || undefined,
      });
      setShowSuccess(true);
      onConfirmSuccess?.(result);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowSuccess(false);
    setError(null);
    setDeliveryAddress('');
    setNotes('');
    onClose();
  };

  const overlayStyle = { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' };
  const modalStyle = { backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto' as const };
  const buttonStyle = { width: '100%', padding: '0.85rem', borderRadius: '10px', backgroundColor: isLoading || !isQuantityValid ? '#94a3b8' : '#10b981', color: '#ffffff', fontWeight: 700, fontSize: '1rem', cursor: isLoading || !isQuantityValid ? 'not-allowed' : 'pointer' };

  return (
    <div style={overlayStyle} onClick={closeModal}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={closeModal} disabled={isLoading} aria-label="Close order dialog" style={{ float: 'right', border: 0, backgroundColor: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', color: '#64748b', fontSize: '1.2rem' }}>&times;</button>
        {showSuccess ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}><div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '2rem', display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem' }}>✓</div><h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Order Placed Successfully!</h2><p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Your order for <strong>{quantity} {currentProduct.unit}</strong> of <strong>{currentProduct.name}</strong> has been received.</p><div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'left' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Total Billed:</span><strong style={{ color: '#10b981' }}>₹{totalPrice}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Status:</span><strong style={{ color: '#0284c7' }}>CONFIRMED</strong></div></div><button type="button" onClick={closeModal} style={buttonStyle}>Done</button></div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ color: '#0f172a', margin: '0 0 1.5rem' }}>Confirm Wholesale Order</h2>
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}><strong style={{ color: '#0f172a' }}>{currentProduct.name}</strong><p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>₹{currentProduct.price.toFixed(2)} / {currentProduct.unit} · {maxQty} {currentProduct.unit} available</p></div>
            <label htmlFor="order-quantity" style={{ display: 'block', color: '#334155', fontWeight: 600, marginBottom: '0.4rem' }}>Quantity ({currentProduct.unit})</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.4rem' }}><button type="button" onClick={() => updateQuantity(quantity - 1)} disabled={quantity <= 0} aria-label="Decrease quantity" style={{ width: '40px', height: '40px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff', fontSize: '1.2rem' }}>-</button><input id="order-quantity" type="number" min="0" max={maxQty} value={quantity} onChange={(event) => updateQuantity(Number(event.target.value) || 0)} style={{ ...fieldStyle, flex: 1, textAlign: 'center', fontWeight: 700 }} /><button type="button" onClick={() => updateQuantity(quantity + 1)} disabled={quantity >= maxQty} aria-label="Increase quantity" style={{ width: '40px', height: '40px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff', fontSize: '1.2rem' }}>+</button></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem', marginBottom: '1.25rem' }}><span>Minimum: {minQty} {currentProduct.unit}</span><span>Maximum: {maxQty} {currentProduct.unit}</span></div>
            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.9rem 1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}><span style={{ color: '#065f46' }}>Wholesale subtotal<br /><small>{quantity} × ₹{currentProduct.price.toFixed(2)}</small></span><strong style={{ color: '#065f46', fontSize: '1.5rem' }}>₹{totalPrice}</strong></div>
            <label htmlFor="delivery-address" style={{ display: 'block', color: '#334155', fontWeight: 600, marginBottom: '0.4rem' }}>Retail Store Delivery Address *</label><textarea id="delivery-address" required rows={2} placeholder="Enter store name, street, locality, city and pin code..." value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} style={{ ...fieldStyle, resize: 'vertical' as const, marginBottom: '1rem' }} />
            <label htmlFor="delivery-notes" style={{ display: 'block', color: '#334155', fontWeight: 600, marginBottom: '0.4rem' }}>Delivery Instructions / Notes (Optional)</label><input id="delivery-notes" type="text" placeholder="e.g. Early morning delivery preferred" value={notes} onChange={(event) => setNotes(event.target.value)} style={{ ...fieldStyle, marginBottom: '1.25rem' }} />
            {error && <p role="alert" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}><button type="button" onClick={closeModal} disabled={isLoading} style={{ ...buttonStyle, backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', cursor: isLoading ? 'not-allowed' : 'pointer' }}>Cancel</button><button type="submit" disabled={isLoading || !isQuantityValid} style={buttonStyle}>{isLoading ? 'Confirming Order...' : `Confirm & Place Order (₹${totalPrice})`}</button></div>
          </form>
        )}
      </div>
    </div>
  );
}
