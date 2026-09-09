"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getOrders } from "@/lib/api";

export default function OrdersPage() {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const effectiveRole = role || user?.role;
  const [orders, setOrders] = useState<any[]>([]);
  const [isFetchingOrders, setIsFetchingOrders] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      getOrders()
        .then(data => setOrders(data || []))
        .catch(err => console.error("Failed to fetch orders:", err))
        .finally(() => setIsFetchingOrders(false));
    } else {
      setIsFetchingOrders(false);
    }
  }, [isAuthenticated]);

  if (isLoading || isFetchingOrders) {
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
        <p style={{ marginTop: "1rem", color: "#64748b" }}>Loading Orders...</p>
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
          You must be logged in to view your wholesale order history, delivery dispatches, and real-time shipment status.
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
            Ready to Place Wholesale Orders
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
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {orders.map((order) => (
            <div key={order.id} style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem" }}>
                <div>
                  <h3 style={{ color: "#0f172a", fontWeight: 700, fontSize: "1.1rem" }}>Order #{order.id.slice(-6).toUpperCase()}</h3>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ display: "inline-block", padding: "0.25rem 0.75rem", backgroundColor: order.status === "CONFIRMED" ? "#ecfdf5" : "#f8fafc", color: order.status === "CONFIRMED" ? "#10b981" : "#64748b", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>
                    {order.status}
                  </span>
                  <div style={{ marginTop: "0.5rem", fontWeight: 800, color: "#0f172a" }}>₹{order.totalAmount.toFixed(2)}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {order.items?.map((item: any) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "8px", backgroundColor: "#f8fafc", overflow: "hidden" }}>
                        {item.produce?.imageUrl ? (
                          <img src={item.produce.imageUrl} alt={item.produce.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🥬</div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#334155" }}>{item.produce?.name || "Unknown Produce"}</div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{item.quantity} units @ ₹{item.priceAtPurchase}/unit</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: "#334155" }}>₹{(item.quantity * item.priceAtPurchase).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              {order.deliveryAddress && (
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9", fontSize: "0.85rem", color: "#64748b" }}>
                  <strong>Delivery to:</strong> {order.deliveryAddress}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
