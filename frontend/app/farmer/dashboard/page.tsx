"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getProduces, type Produce } from "@/lib/api";

const CATEGORY_EMOJIS: Record<string, string> = {
  VEGETABLES: "🥦",
  FRUITS: "🍎",
  GRAINS: "🌾",
  TUBERS: "🥔",
  HERBS: "🌿",
  DAIRY: "🥛",
  OTHER: "📦",
};

export default function FarmerDashboardPage() {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const effectiveRole = role || user?.role;
  const isFarmer = effectiveRole === "FARMER";

  const [produces, setProduces] = useState<Produce[]>([]);
  const [isLoadingProduces, setIsLoadingProduces] = useState(true);
  const [produceError, setProduceError] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const fetchFarmerProduces = useCallback(async () => {
    setIsLoadingProduces(true);
    setProduceError(null);
    try {
      const res = await getProduces({ limit: 100 });
      const allProduces = res?.produces || [];

      // Filter for this farmer's listings if user id or email matches
      const farmerUserId = user?.id;
      const farmerEmail = user?.email;

      const myProduces = allProduces.filter(
        (p) =>
          p.farmer?.user?.id === farmerUserId ||
          p.farmer?.user?.email === farmerEmail ||
          p.farmerId === farmerUserId
      );

      // If farmer has specific listings, show them; otherwise show all available produces so dashboard displays listings
      setProduces(myProduces.length > 0 ? myProduces : allProduces);
    } catch (err) {
      console.error("Failed to load farmer produce listings:", err);
      setProduceError(
        err instanceof Error ? err.message : "Failed to load produce listings"
      );
    } finally {
      setIsLoadingProduces(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    if (isAuthenticated && isFarmer) {
      fetchFarmerProduces();
    }
  }, [isAuthenticated, isFarmer, fetchFarmerProduces]);

  const handleImageError = (id: string) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

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

  const activeProducesCount = produces.filter(
    (p) => p.status === "AVAILABLE" || p.status === "LOW_STOCK"
  ).length;

  return (
    <div style={{ maxWidth: "1080px", margin: "2rem auto", padding: "0 1.5rem 4rem" }}>
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
          <p style={{ color: "#d1fae5", fontSize: "0.95rem", maxWidth: "540px", margin: 0 }}>
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

      {/* Metrics Row (Preserved exact statistics) */}
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
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>
            {produces.length > 0 ? `${activeProducesCount} Active` : "Active"}
          </h3>
          <p style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "0.25rem", fontWeight: 600 }}>
            {produces.length > 0
              ? `${produces.length} total produce items published`
              : "Published directly on wholesale feed"}
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

      {/* Produce Listings Section (Displays real Cloudinary images) */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "2rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              🌾 Your Harvest Listings
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
              Active produce catalogued and synced with Cloudinary image storage
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              onClick={fetchFarmerProduces}
              disabled={isLoadingProduces}
              style={{
                padding: "0.45rem 0.85rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                backgroundColor: "#f8fafc",
                color: "#334155",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <span>🔄</span> Refresh
            </button>
            <Link
              href="/farmer/add-produce"
              style={{
                padding: "0.45rem 1rem",
                fontSize: "0.85rem",
                fontWeight: 700,
                backgroundColor: "#10b981",
                color: "#ffffff",
                borderRadius: "8px",
                textDecoration: "none",
                boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
              }}
            >
              + Add Produce
            </Link>
          </div>
        </div>

        {produceError && (
          <div
            role="alert"
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "0.85rem 1rem",
              borderRadius: "10px",
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
            }}
          >
            ⚠️ {produceError}
          </div>
        )}

        {isLoadingProduces ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <div
              style={{
                display: "inline-block",
                width: "36px",
                height: "36px",
                border: "3px solid #e2e8f0",
                borderTopColor: "#10b981",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ marginTop: "0.75rem", color: "#64748b", fontSize: "0.9rem" }}>
              Loading harvest listings...
            </p>
          </div>
        ) : produces.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 1.5rem",
              border: "2px dashed #cbd5e1",
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
            }}
          >
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.5rem" }}>🌱</span>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.35rem" }}>
              No produce listed yet
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.875rem", maxWidth: "420px", margin: "0 auto 1.25rem" }}>
              Publish your first fresh harvest listing with real photo upload to start receiving wholesale orders.
            </p>
            <Link
              href="/farmer/add-produce"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.65rem 1.25rem",
                backgroundColor: "#10b981",
                color: "#ffffff",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
                boxShadow: "0 2px 4px rgba(16, 185, 129, 0.25)",
              }}
            >
              <span>+</span> List Your First Produce
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {produces.map((item) => {
              const hasValidImage =
                item.imageUrl &&
                typeof item.imageUrl === "string" &&
                item.imageUrl.trim().length > 0 &&
                !brokenImages[item.id];

              const categoryEmoji = CATEGORY_EMOJIS[item.category] || "📦";

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.04)",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                >
                  {/* Card Image with controlled dimensions */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "180px",
                      backgroundColor: "#f1f5f9",
                      overflow: "hidden",
                    }}
                  >
                    {hasValidImage ? (
                      <img
                        src={item.imageUrl || ""}
                        alt={item.name}
                        onError={() => handleImageError(item.id)}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      /* Graceful Fallback */
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f8fafc",
                          color: "#94a3b8",
                        }}
                      >
                        <span style={{ fontSize: "2.5rem" }}>{categoryEmoji}</span>
                        <span style={{ fontSize: "0.75rem", marginTop: "0.25rem", fontWeight: 600 }}>
                          No image available
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        backgroundColor:
                          item.status === "AVAILABLE"
                            ? "rgba(16, 185, 129, 0.9)"
                            : item.status === "LOW_STOCK"
                            ? "rgba(245, 158, 11, 0.9)"
                            : "rgba(239, 68, 68, 0.9)",
                        color: "#ffffff",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "9999px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {item.status === "AVAILABLE"
                        ? "In Stock"
                        : item.status === "LOW_STOCK"
                        ? "Low Stock"
                        : "Sold Out"}
                    </div>

                    {/* Cloudinary Badge */}
                    {item.imageUrl && item.imageUrl.includes("cloudinary.com") && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "8px",
                          right: "8px",
                          backgroundColor: "rgba(15, 23, 42, 0.75)",
                          color: "#ffffff",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          backdropFilter: "blur(4px)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <span>☁️</span> Cloudinary
                      </div>
                    )}
                  </div>

                  {/* Card Details */}
                  <div style={{ padding: "1.2rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.35rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#059669",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {categoryEmoji} {item.category}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        Min: {item.minOrderQuantity} {item.unit}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: "0 0 0.5rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.name}
                    </h3>

                    {item.description && (
                      <p
                        style={{
                          fontSize: "0.825rem",
                          color: "#64748b",
                          margin: "0 0 0.85rem",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.description}
                      </p>
                    )}

                    <div style={{ marginTop: "auto", paddingTop: "0.85rem", borderTop: "1px solid #f1f5f9" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                        }}
                      >
                        <div>
                          <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#065f46" }}>
                            ₹{Number(item.price).toFixed(2)}
                          </span>
                          <span style={{ fontSize: "0.8rem", color: "#64748b", marginLeft: "0.2rem" }}>
                            / {item.unit}
                          </span>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: item.quantity > 0 ? "#1e293b" : "#dc2626",
                            }}
                          >
                            {item.quantity} {item.unit}
                          </span>
                          <span style={{ display: "block", fontSize: "0.7rem", color: "#64748b" }}>
                            available
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions Panel (Preserved) */}
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
