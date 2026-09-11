"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function OrdersPage() {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const effectiveRole = role || user?.role;

  if (isLoading) {
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

  const isFarmer = effectiveRole === "FARMER";

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
            The Orders section is designed for retail buyers tracking wholesale produce purchases. To manage your farm produce listings, incoming demand, and inventory, please use the Farmer Portal.
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
            <Link
              href="/catalogue"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.85rem 1.5rem",
                backgroundColor: "#f8fafc",
                color: "#334155",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "0.95rem",
                textDecoration: "none",
                border: "1px solid #cbd5e1",
              }}
            >
              Browse Catalogue
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

      {/* Orders List / Empty State */}
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
    </div>
  );
}
