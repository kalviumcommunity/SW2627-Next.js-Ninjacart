"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getOrders } from "@/lib/api";

interface OrderItem {
  id: string;
  produceId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  produce?: {
    name: string;
    unit: string;
    imageUrl?: string | null;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  deliveryAddress?: string | null;
  notes?: string | null;
  createdAt: string;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const { user, role, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const effectiveRole = role || user?.role;
  const isFarmer = effectiveRole === "FARMER";

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrdersData() {
      if (!isAuthenticated || isFarmer) {
        setIsLoadingOrders(false);
        return;
      }

      setIsLoadingOrders(true);
      setError(null);
      try {
        const data = await getOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setIsLoadingOrders(false);
      }
    }

    if (!isAuthLoading) {
      loadOrdersData();
    }
  }, [isAuthenticated, isFarmer, isAuthLoading]);

  if (isAuthLoading || (isAuthenticated && !isFarmer && isLoadingOrders)) {
    return (
      <div style={{ maxWidth: "800px", margin: "3rem auto", padding: "2rem", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            width: "48px",
            height: "48px",
            border: "4px solid #e2e8f0",
            borderTopColor: "#10b981",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: 600 }}>Loading Orders...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          maxWidth: "540px",
          margin: "4rem auto",
          padding: "2.5rem",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            backgroundColor: "#eff6ff",
            color: "#2563eb",
            fontSize: "1.75rem",
            marginBottom: "1.25rem",
          }}
        >
          📦
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
          Sign In to Track Orders
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          You must be logged in as a Retailer to view your wholesale order history, delivery dispatches, and shipment tracking.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            href="/login?redirect=/orders"
            style={{
              padding: "0.85rem 1.5rem",
              backgroundColor: "#10b981",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
            }}
          >
            Sign In to Account
          </Link>

          <Link
            href="/catalogue"
            style={{
              padding: "0.85rem 1.5rem",
              backgroundColor: "#f8fafc",
              color: "#334155",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.95rem",
              border: "1px solid #cbd5e1",
              textDecoration: "none",
            }}
          >
            Browse Wholesale Catalogue
          </Link>
        </div>
      </div>
    );
  }

  if (isFarmer) {
    return (
      <div style={{ maxWidth: "640px", margin: "4rem auto", padding: "0 1.5rem" }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "3.5rem 2rem",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👨‍🌾</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
            Farmer Account Detected
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
            The Orders section is designed for retail buyers tracking wholesale produce purchases. To manage your farm produce listings and inventory, please use your Farmer Dashboard.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/farmer/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.85rem 1.75rem",
                backgroundColor: "#10b981",
                color: "#ffffff",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
                boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
              }}
            >
              Go to Farmer Portal →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 1.5rem 4rem" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          borderRadius: "20px",
          padding: "2.5rem 2rem",
          color: "#ffffff",
          marginBottom: "2rem",
          boxShadow: "0 10px 25px -5px rgba(30, 41, 59, 0.2)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            padding: "0.3rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.8rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "0.75rem",
          }}
        >
          📦 Wholesale Orders
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
          My Order History
        </h1>
        <p style={{ color: "#cbd5e1", fontSize: "0.95rem", maxWidth: "560px" }}>
          Signed in as <strong>{user?.name}</strong> ({effectiveRole || "Retailer"}). Track confirmed farm dispatches, transit status, and delivery invoices.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: "1rem",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            borderRadius: "12px",
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Orders List / Empty State */}
      {orders.length === 0 ? (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "3.5rem 2rem",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
            No Orders Placed Yet
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 1.5rem" }}>
            Browse our live verified farm produce catalogue to place wholesale direct-to-retail orders with 0% middleman markup.
          </p>
          <Link
            href="/catalogue"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.85rem 1.75rem",
              backgroundColor: "#10b981",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
            }}
          >
            Explore Produce Catalogue →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  padding: "1.5rem",
                  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid #f1f5f9",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                      Order Ref
                    </span>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                      #{order.orderNumber ? order.orderNumber.slice(0, 8) : order.id.slice(0, 8)}
                    </h3>
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{formattedDate}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span
                      style={{
                        padding: "0.3rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        backgroundColor:
                          order.status === "CONFIRMED" || order.status === "DELIVERED"
                            ? "#dcfce7"
                            : order.status === "PROCESSING"
                              ? "#e0f2fe"
                              : "#fef3c7",
                        color:
                          order.status === "CONFIRMED" || order.status === "DELIVERED"
                            ? "#15803d"
                            : order.status === "PROCESSING"
                              ? "#0369a1"
                              : "#b45309",
                      }}
                    >
                      {order.status}
                    </span>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Total Amount</span>
                      <strong style={{ fontSize: "1.25rem", color: "#065f46", fontWeight: 800 }}>
                        ₹{order.totalAmount.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.6rem 0.85rem",
                          backgroundColor: "#f8fafc",
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontWeight: 700, color: "#0f172a" }}>
                            {item.produce?.name || "Produce Item"}
                          </span>
                          <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                            ({item.quantity} {item.produce?.unit || "kg"} @ ₹{item.unitPrice})
                          </span>
                        </div>
                        <strong style={{ color: "#334155" }}>₹{item.totalPrice.toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Delivery Address */}
                {order.deliveryAddress && (
                  <div style={{ fontSize: "0.85rem", color: "#64748b", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
                    📍 <strong>Delivery Address:</strong> {order.deliveryAddress}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
