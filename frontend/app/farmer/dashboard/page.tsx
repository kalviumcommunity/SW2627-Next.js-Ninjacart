"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function FarmerDashboardPage() {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const effectiveRole = role || user?.role;
  const isFarmer = effectiveRole === "FARMER";

  if (isLoading) {
    return (
      <div style={{ maxWidth: "1000px", margin: "3rem auto", padding: "2rem", textAlign: "center" }}>
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
        <p style={{ marginTop: "1rem", color: "#64748b" }}>Loading Farmer Portal...</p>
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
            backgroundColor: "#fef3c7",
            color: "#d97706",
            fontSize: "1.75rem",
            marginBottom: "1.25rem",
          }}
        >
          🔒
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
          Farmer Authentication Required
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          Please sign in to your registered farmer account to access your farm dashboard, manage inventory, and list produce.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            href="/login?redirect=/farmer/dashboard"
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
            Sign In to Farmer Portal
          </Link>

          <Link
            href="/register"
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
            Register as Farmer
          </Link>
        </div>
      </div>
    );
  }

  if (!isFarmer) {
    return (
      <div
        style={{
          maxWidth: "540px",
          margin: "4rem auto",
          padding: "2.5rem",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #fee2e2",
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
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            fontSize: "1.75rem",
            marginBottom: "1.25rem",
          }}
        >
          🚫
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
          Farmer Portal Access Only
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          You are signed in as a <strong>{effectiveRole || "Retailer"}</strong>. The Farmer Dashboard is exclusively accessible to registered farmers.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            href="/catalogue"
            style={{
              padding: "0.85rem 1.5rem",
              backgroundColor: "#10b981",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.95rem",
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
      {/* Dashboard Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
          borderRadius: "20px",
          padding: "2.5rem 2rem",
          color: "#ffffff",
          marginBottom: "2rem",
          boxShadow: "0 10px 25px -5px rgba(6, 78, 59, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
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
            🚜 Verified Farmer
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
            Welcome, {user?.name || "Farmer"}!
          </h1>
          <p style={{ color: "#d1fae5", fontSize: "0.95rem", maxWidth: "540px" }}>
            Manage your harvest listings, set wholesale prices, and connect directly with retail buyers across India.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link
            href="/farmer/add-produce"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.85rem 1.5rem",
              backgroundColor: "#ffffff",
              color: "#065f46",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <span>+</span> List New Produce
          </Link>
          <Link
            href="/catalogue"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.85rem 1.25rem",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.95rem",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              textDecoration: "none",
            }}
          >
            View Live Catalogue
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.5rem" }}>📦</span>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
            Direct Produce Listings
          </span>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>Active</h3>
          <p style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "0.25rem", fontWeight: 600 }}>
            Published directly on wholesale feed
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.5rem" }}>💰</span>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
            Payment & Settlement
          </span>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>0% Margin</h3>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
            Direct buyer payments with 24h bank settlement
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.5rem" }}>🚚</span>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
            Logistics Support
          </span>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>Farm Pickup</h3>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
            Ninjacart fleet handles farm gate transit
          </p>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "2rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>
          Quick Farm Actions
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          <Link
            href="/farmer/add-produce"
            style={{
              padding: "1.25rem",
              borderRadius: "12px",
              border: "1px solid #d1fae5",
              backgroundColor: "#ecfdf5",
              textDecoration: "none",
              display: "block",
              transition: "transform 0.2s ease",
            }}
          >
            <div style={{ fontWeight: 700, color: "#065f46", fontSize: "1rem", marginBottom: "0.35rem" }}>
              🌱 Add New Produce Listing
            </div>
            <p style={{ fontSize: "0.875rem", color: "#047857", margin: 0 }}>
              Specify produce category, stock volume, wholesale unit pricing, and upload photos.
            </p>
          </Link>

          <Link
            href="/catalogue"
            style={{
              padding: "1.25rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              textDecoration: "none",
              display: "block",
            }}
          >
            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "1rem", marginBottom: "0.35rem" }}>
              🛒 View Marketplace Catalogue
            </div>
            <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
              Inspect live market rates, stock availability, and buyer-facing product cards.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
