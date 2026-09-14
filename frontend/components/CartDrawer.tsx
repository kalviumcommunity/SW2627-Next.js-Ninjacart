"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/lib/api";
import OrderSuccessModal, { OrderSuccessData } from "./OrderSuccessModal";

export default function CartDrawer() {
  const { items, totalCount, totalAmount, isCartOpen, closeCart, updateQuantity, removeItem, clearCart } = useCart();
  const { user, role, isAuthenticated } = useAuth();
  const router = useRouter();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<OrderSuccessData | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isFarmer = (role || user?.role) === "FARMER";

  if (!isCartOpen && !showSuccessModal) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!isAuthenticated) {
      closeCart();
      router.push("/login?redirect=/catalogue");
      return;
    }

    if (isFarmer) {
      setError("Wholesale orders can only be placed by Retailer accounts.");
      return;
    }

    if (!deliveryAddress.trim()) {
      setError("Please provide a delivery address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderPayload = {
        items: items.map((item) => ({
          produceId: item.produceId,
          quantity: item.quantity,
        })),
        deliveryAddress: deliveryAddress.trim(),
        notes: notes.trim() || undefined,
      };

      const result = await createOrder(orderPayload);

      const orderData: OrderSuccessData = {
        id: result?.id,
        orderNumber: result?.orderNumber || result?.id,
        totalAmount: result?.totalAmount || totalAmount,
        status: result?.status || "PENDING",
        deliveryAddress: deliveryAddress.trim(),
        notes: notes.trim(),
        itemCount: items.length,
      };

      setSuccessOrder(orderData);
      clearCart();
      closeCart();
      setShowSuccessModal(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to place wholesale order. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isCartOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 90,
            display: "flex",
            justifyContent: "flex-end",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={closeCart}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              height: "100%",
              backgroundColor: "#ffffff",
              boxShadow: "-8px 0 25px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              zIndex: 95,
              animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.35rem" }}>🛒</span>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Wholesale Cart
                </h2>
                <span
                  style={{
                    backgroundColor: "#10b981",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.55rem",
                    borderRadius: "9999px",
                  }}
                >
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              <button
                type="button"
                onClick={closeCart}
                style={{
                  border: "none",
                  backgroundColor: "#ffffff",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  fontSize: "1.25rem",
                  color: "#64748b",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
              {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#64748b" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧺</div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#334155", marginBottom: "0.5rem" }}>
                    Your cart is empty
                  </h3>
                  <p style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                    Browse our farm catalogue to source fresh wholesale harvest.
                  </p>
                  <Link
                    href="/catalogue"
                    onClick={closeCart}
                    style={{
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#10b981",
                      color: "#ffffff",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    Explore Catalogue
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {items.map((item) => {
                    const itemTotal = (item.price * item.quantity).toFixed(2);
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          gap: "1rem",
                          padding: "1rem",
                          backgroundColor: "#f8fafc",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          position: "relative",
                        }}
                      >
                        {/* Image */}
                        <div
                          style={{
                            width: "72px",
                            height: "72px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            backgroundColor: "#e2e8f0",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={
                              item.imageUrl ||
                              "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=150&q=80"
                            }
                            alt={item.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <h4
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                color: "#0f172a",
                                margin: "0 0 0.2rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(item.produceId)}
                              style={{
                                border: "none",
                                background: "none",
                                color: "#94a3b8",
                                cursor: "pointer",
                                fontSize: "1rem",
                                padding: "0 0.25rem",
                              }}
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </div>

                          <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.5rem" }}>
                            ₹{item.price} / {item.unit} • {item.farmerName}
                          </div>

                          {/* Quantity Controls & Price */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                backgroundColor: "#ffffff",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.produceId, item.quantity - 1)}
                                style={{
                                  padding: "0.25rem 0.6rem",
                                  border: "none",
                                  background: "none",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  color: "#334155",
                                }}
                              >
                                -
                              </button>
                              <span style={{ fontSize: "0.85rem", fontWeight: 700, padding: "0 0.4rem", color: "#0f172a" }}>
                                {item.quantity} {item.unit}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.produceId, item.quantity + 1)}
                                disabled={item.quantity >= item.availableStock}
                                style={{
                                  padding: "0.25rem 0.6rem",
                                  border: "none",
                                  background: "none",
                                  fontWeight: 700,
                                  cursor: item.quantity >= item.availableStock ? "not-allowed" : "pointer",
                                  color: item.quantity >= item.availableStock ? "#cbd5e1" : "#334155",
                                }}
                              >
                                +
                              </button>
                            </div>

                            <div style={{ fontSize: "1rem", fontWeight: 800, color: "#065f46" }}>
                              ₹{itemTotal}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Checkout Form */}
            {items.length > 0 && (
              <div
                style={{
                  padding: "1.25rem",
                  borderTop: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.05)",
                }}
              >
                {/* Subtotal */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "1rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "#ecfdf5",
                    borderRadius: "10px",
                    border: "1px solid #d1fae5",
                  }}
                >
                  <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#065f46" }}>
                    Total Wholesale Subtotal:
                  </span>
                  <strong style={{ fontSize: "1.45rem", fontWeight: 900, color: "#065f46" }}>
                    ₹{totalAmount.toFixed(2)}
                  </strong>
                </div>

                <form onSubmit={handleCheckout}>
                  {/* Delivery Address */}
                  <div style={{ marginBottom: "0.75rem" }}>
                    <label
                      htmlFor="cart-address"
                      style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}
                    >
                      Delivery Store Address *
                    </label>
                    <input
                      id="cart-address"
                      type="text"
                      placeholder="e.g. Shop #4, City Market, Bengaluru"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.875rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: "1rem" }}>
                    <input
                      id="cart-notes"
                      type="text"
                      placeholder="Special delivery notes (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.85rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  {error && (
                    <div
                      role="alert"
                      style={{
                        padding: "0.6rem 0.85rem",
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#dc2626",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {/* Checkout Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isFarmer}
                    style={{
                      width: "100%",
                      padding: "0.95rem",
                      backgroundColor: isSubmitting || isFarmer ? "#94a3b8" : "#10b981",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "1rem",
                      fontWeight: 700,
                      cursor: isSubmitting || isFarmer ? "not-allowed" : "pointer",
                      boxShadow: "0 2px 6px rgba(16, 185, 129, 0.3)",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    {isSubmitting
                      ? "Processing Wholesale Order..."
                      : isFarmer
                      ? "Farmers Cannot Place Orders"
                      : `Place Wholesale Order (₹${totalAmount.toFixed(2)})`}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Order Confirmation Modal */}
      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderData={successOrder}
      />
    </>
  );
}
