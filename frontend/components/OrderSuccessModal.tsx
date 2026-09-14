"use client";

import React from "react";
import Link from "next/link";

export interface OrderSuccessData {
  id?: string;
  orderNumber?: string;
  totalAmount: number;
  status: string;
  deliveryAddress?: string;
  notes?: string;
  itemCount?: number;
  items?: Array<{
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: OrderSuccessData | null;
}

export default function OrderSuccessModal({
  isOpen,
  onClose,
  orderData,
}: OrderSuccessModalProps) {
  if (!isOpen || !orderData) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 110,
        padding: "1rem",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          maxWidth: "520px",
          width: "100%",
          padding: "2.25rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
          maxHeight: "90vh",
          overflowY: "auto",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Animated Badge */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundColor: "#dcfce7",
            color: "#16a34a",
            fontSize: "2.25rem",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 1.25rem",
            boxShadow: "0 0 0 8px #f0fdf4",
          }}
        >
          ✓
        </div>

        <h2
          style={{
            fontSize: "1.65rem",
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: "0.5rem",
            letterSpacing: "-0.02em",
          }}
        >
          Order Placed Successfully!
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
          Your wholesale produce order has been recorded and transmitted to local producers.
        </p>

        {/* Order Details Card */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "1.25rem",
            marginBottom: "1.5rem",
            textAlign: "left",
          }}
        >
          {orderData.orderNumber && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "0.75rem",
                borderBottom: "1px solid #e2e8f0",
                marginBottom: "0.75rem",
              }}
            >
              <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Order ID</span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  backgroundColor: "#ffffff",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  color: "#0f172a",
                }}
              >
                #{orderData.orderNumber.slice(0, 8)}
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            <span style={{ color: "#64748b" }}>Order Status:</span>
            <span
              style={{
                fontWeight: 700,
                color: "#0284c7",
                backgroundColor: "#e0f2fe",
                padding: "0.15rem 0.6rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {orderData.status || "CONFIRMED"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Total Amount:</span>
            <strong style={{ fontSize: "1.35rem", color: "#065f46", fontWeight: 800 }}>
              ₹{orderData.totalAmount.toFixed(2)}
            </strong>
          </div>

          {orderData.deliveryAddress && (
            <div
              style={{
                marginTop: "0.75rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid #e2e8f0",
                fontSize: "0.85rem",
              }}
            >
              <span style={{ color: "#64748b", fontWeight: 600, display: "block", marginBottom: "0.2rem" }}>
                Delivery Destination:
              </span>
              <span style={{ color: "#334155" }}>{orderData.deliveryAddress}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "0.85rem 1.25rem",
              backgroundColor: "#f8fafc",
              color: "#334155",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
          >
            Continue Shopping
          </button>

          <Link
            href="/orders"
            onClick={onClose}
            style={{
              flex: 1.2,
              padding: "0.85rem 1.25rem",
              backgroundColor: "#10b981",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(16, 185, 129, 0.3)",
              transition: "background-color 0.2s ease",
            }}
          >
            📦 Track in Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
