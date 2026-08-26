'use client';

import React, { useState } from 'react';
import { Produce } from '../lib/api';

interface OrderModalProps {
  produce: Produce | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderModal({ produce, isOpen, onClose }: OrderModalProps) {
  const [quantity, setQuantity] = useState<number>(produce ? produce.minOrderQuantity || 1 : 1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Sync min quantity when produce changes
  React.useEffect(() => {
    if (produce) {
      setQuantity(produce.minOrderQuantity || 1);
      setOrderSuccess(false);
    }
  }, [produce]);

  if (!isOpen || !produce) return null;

  const minQty = produce.minOrderQuantity || 1;
  const maxQty = produce.quantity;
  const totalPrice = (quantity * produce.price).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate placing order
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderSuccess(true);
    }, 800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          maxWidth: '520px',
          width: '100%',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            border: 'none',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            cursor: 'pointer',
          }}
        >
          &times;
        </button>

        {orderSuccess ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                fontSize: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              ✓
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Order Placed Successfully!
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Your order for <strong>{quantity} {produce.unit}</strong> of <strong>{produce.name}</strong> has been received and routed directly to the farmer.
            </p>
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.5rem',
                textAlign: 'left',
                fontSize: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Total Billed:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>₹{totalPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <span style={{ fontWeight: 600, color: '#0284c7' }}>CONFIRMED</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '10px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              {produce.imageUrl && (
                <img
                  src={produce.imageUrl}
                  alt={produce.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                  }}
                />
              )}
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#10b981',
                    textTransform: 'uppercase',
                  }}
                >
                  Quick Wholesale Order
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {produce.name}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  ₹{produce.price.toFixed(2)} / {produce.unit} &bull; {produce.quantity} {produce.unit} available
                </p>
              </div>
            </div>

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
                Order Quantity ({produce.unit})
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(minQty, q - (minQty > 5 ? 5 : 1)))}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '1.2rem',
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
                  value={quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setQuantity(isNaN(val) ? minQty : val);
                  }}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#0f172a',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + (minQty > 5 ? 5 : 1)))}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '1.2rem',
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
                <span>Min: {minQty} {produce.unit}</span>
                <span>Max: {maxQty} {produce.unit}</span>
              </div>
            </div>

            {/* Total Price preview */}
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '0.9rem 1.25rem',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: '#065f46', display: 'block', fontWeight: 600 }}>
                  Estimated Total
                </span>
                <span style={{ fontSize: '0.75rem', color: '#047857' }}>
                  ({quantity} {produce.unit} &times; ₹{produce.price.toFixed(2)})
                </span>
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#065f46' }}>
                ₹{totalPrice}
              </span>
            </div>

            {/* Delivery Address */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.4rem',
                }}
              >
                Retail Store Delivery Address *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Enter store name, street, locality, city and pin code..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.4rem',
                }}
              >
                Delivery Instructions / Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Early morning delivery preferred"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || quantity < minQty || quantity > maxQty}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '10px',
                backgroundColor: isSubmitting ? '#94a3b8' : '#10b981',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                transition: 'background-color 0.2s',
              }}
            >
              {isSubmitting ? 'Confirming Order...' : `Confirm & Place Order (₹${totalPrice})`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
