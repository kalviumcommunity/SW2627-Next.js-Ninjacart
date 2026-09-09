"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/api";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create order
      await createOrder({
        items: items.map(item => ({ produceId: item.produceId, quantity: item.quantity })),
        deliveryAddress,
        notes: notes || undefined,
      });
      
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process order.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="page-container animate-fade-in" style={{ maxWidth: "800px", padding: "4rem 1.5rem", margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🎉</div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>Payment Successful!</h1>
        <p style={{ color: "#64748b", fontSize: "1.1rem", marginBottom: "2rem" }}>
          Your wholesale order has been placed successfully and is now pending farmer confirmation.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/orders" style={{ padding: "0.8rem 2rem", backgroundColor: "#10b981", color: "white", borderRadius: "8px", fontWeight: 600 }}>
            View Orders
          </Link>
          <Link href="/catalogue" style={{ padding: "0.8rem 2rem", border: "1px solid #cbd5e1", color: "#334155", borderRadius: "8px", fontWeight: 600 }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: "1200px", padding: "2rem 1.5rem", margin: "0 auto", minHeight: "80vh" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "2rem", color: "#0f172a" }}>Your Cart</h1>
      
      {items.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "4rem 2rem", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🛒</div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>Your cart is currently empty</h3>
          <p style={{ color: "#64748b", fontSize: "1rem", marginBottom: "2rem", lineHeight: 1.5 }}>Looks like you haven't added any produce to your cart yet.</p>
          <Link href="/catalogue" style={{ display: "inline-block", padding: "0.8rem 2rem", backgroundColor: "#16a34a", color: "#ffffff", fontWeight: 600, borderRadius: "8px", textDecoration: "none" }}>
            Browse Catalogue
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", alignItems: "start" }}>
          {/* Cart Items List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {items.map((item) => (
              <div key={item.produceId} style={{ display: "flex", gap: "1.5rem", backgroundColor: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ width: "100px", height: "100px", backgroundColor: "#f8fafc", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                  <img src={item.imagePublicId || "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80"} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>{item.name}</h3>
                    <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>₹{(item.price * item.quantity).toFixed(2)}</strong>
                  </div>
                  <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1rem" }}>₹{item.price} / {item.unit}</p>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button 
                        onClick={() => updateQuantity(item.produceId, item.quantity - 1)}
                        style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "white", cursor: "pointer" }}
                      >-</button>
                      <span style={{ fontWeight: 600, minWidth: "30px", textAlign: "center" }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.produceId, item.quantity + 1)}
                        style={{ width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "white", cursor: "pointer" }}
                      >+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.produceId)} style={{ color: "#ef4444", fontSize: "0.875rem", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", position: "sticky", top: "2rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.5rem" }}>Order Summary</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", color: "#475569" }}>
              <span>Total Items</span>
              <strong>{totalItems}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", color: "#475569" }}>
              <span>Subtotal</span>
              <strong>₹{totalPrice.toFixed(2)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>Total</span>
              <strong style={{ fontSize: "1.5rem", color: "#10b981" }}>₹{totalPrice.toFixed(2)}</strong>
            </div>

            {!isCheckingOut ? (
              <button 
                onClick={() => setIsCheckingOut(true)}
                style={{ width: "100%", padding: "1rem", backgroundColor: "#10b981", color: "white", borderRadius: "8px", fontWeight: 700, fontSize: "1.1rem", border: "none", cursor: "pointer" }}
              >
                Proceed to Checkout
              </button>
            ) : (
              <form onSubmit={handleCheckout} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
                <h4 style={{ fontWeight: 600, color: "#0f172a" }}>Delivery Details</h4>
                <textarea 
                  required
                  placeholder="Delivery Address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", resize: "vertical", minHeight: "80px", fontFamily: "inherit" }}
                />
                <input 
                  type="text"
                  placeholder="Delivery Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontFamily: "inherit" }}
                />

                <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "0.5rem" }}>
                  <h4 style={{ fontWeight: 600, color: "#0f172a", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Payment Method</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input type="radio" id="pay-upi" name="payment" defaultChecked />
                    <label htmlFor="pay-upi" style={{ fontSize: "0.9rem", color: "#334155" }}>UPI / Bank Transfer</label>
                  </div>
                </div>

                {error && <p style={{ color: "#ef4444", fontSize: "0.875rem", backgroundColor: "#fef2f2", padding: "0.5rem", borderRadius: "4px" }}>{error}</p>}
                
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button type="button" onClick={() => setIsCheckingOut(false)} disabled={isProcessing} style={{ flex: 1, padding: "0.8rem", backgroundColor: "white", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: 600 }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isProcessing} style={{ flex: 2, padding: "0.8rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: 600 }}>
                    {isProcessing ? "Processing..." : `Pay ₹${totalPrice.toFixed(2)}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
