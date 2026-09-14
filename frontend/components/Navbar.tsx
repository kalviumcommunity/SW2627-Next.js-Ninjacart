/**
 * ============================================================================
 * Dynamic Role-Aware Navbar (Implemented by Jovab)
 * ============================================================================
 * Purpose: Top-level navigation bar adapting links and actions based on user session and role.
 *
 * Flow:
 * 1. Reads auth status and role (FARMER vs RETAILER) from AuthContext.
 * 2. If FARMER: Renders Farmer Portal links (Dashboard, Listings, Orders).
 * 3. If RETAILER: Renders Catalogue, Buyer Orders, and Cart button with live item count badge.
 * 4. If Unauthenticated: Shows Login and Register buttons.
 * 5. Supports mobile navigation menu with automatic route-change closing.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { user, role, isAuthenticated, isLoading, logout } = useAuth();
  const { totalCount, toggleCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu automatically upon navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    logout();
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const isFarmer = (role || user?.role) === "FARMER";
  const isRetailer = (role || user?.role) === "RETAILER";

  return (
    <header className="navbar" style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
      <div className="navbar-container" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Brand Logo */}
        <Link href="/" className="logo-brand" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <img
            src="/ninjacart_logo.png"
            alt="Ninjacart"
            className="brand-logo-image"
            style={{ height: "36px", width: "auto", objectFit: "contain" }}
          />
          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#64748b", display: "none" }} className="brand-subtitle">
            Direct-to-Retail
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Farmer-Only Navigation */}
          {isAuthenticated && isFarmer && (
            <>
              <Link
                href="/farmer/dashboard"
                className={`nav-link ${pathname === "/farmer/dashboard" ? "active" : ""}`}
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: pathname === "/farmer/dashboard" ? "#16a34a" : "#334155",
                  textDecoration: "none",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  backgroundColor: pathname === "/farmer/dashboard" ? "#f0fdf4" : "transparent",
                }}
              >
                🚜 Dashboard
              </Link>

              <Link
                href="/farmer/listings"
                className={`nav-link ${pathname === "/farmer/listings" ? "active" : ""}`}
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: pathname === "/farmer/listings" ? "#16a34a" : "#334155",
                  textDecoration: "none",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  backgroundColor: pathname === "/farmer/listings" ? "#f0fdf4" : "transparent",
                }}
              >
                📋 Listings
              </Link>

              <Link
                href="/farmer/orders"
                className={`nav-link ${pathname === "/farmer/orders" ? "active" : ""}`}
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: pathname === "/farmer/orders" ? "#16a34a" : "#334155",
                  textDecoration: "none",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  backgroundColor: pathname === "/farmer/orders" ? "#f0fdf4" : "transparent",
                }}
              >
                📦 Orders
              </Link>

              <Link
                href="/farmer/add-produce"
                className={`nav-link ${pathname === "/farmer/add-produce" ? "active" : ""}`}
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: pathname === "/farmer/add-produce" ? "#16a34a" : "#334155",
                  textDecoration: "none",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  backgroundColor: pathname === "/farmer/add-produce" ? "#f0fdf4" : "transparent",
                }}
              >
                🌱 Add Produce
              </Link>
            </>
          )}

          {/* Retailer / Guest Navigation */}
          {(!isAuthenticated || isRetailer) && (
            <>
              <Link
                href="/catalogue"
                className={`nav-link ${pathname.startsWith("/catalogue") ? "active" : ""}`}
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: pathname.startsWith("/catalogue") ? "#16a34a" : "#334155",
                  textDecoration: "none",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  backgroundColor: pathname.startsWith("/catalogue") ? "#f0fdf4" : "transparent",
                }}
              >
                🛍️ Produce Catalogue
              </Link>

              {isAuthenticated && isRetailer && (
                <Link
                  href="/orders"
                  className={`nav-link ${pathname === "/orders" ? "active" : ""}`}
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: pathname === "/orders" ? "#16a34a" : "#334155",
                    textDecoration: "none",
                    padding: "0.4rem 0.75rem",
                    borderRadius: "6px",
                    backgroundColor: pathname === "/orders" ? "#f0fdf4" : "transparent",
                  }}
                >
                  📦 My Orders
                </Link>
              )}

              {/* Cart Button */}
              <button
                type="button"
                onClick={toggleCart}
                id="navbar-cart-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.45rem 0.9rem",
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "9999px",
                  color: "#065f46",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                aria-label={`Open shopping cart (${totalCount} items)`}
              >
                <span>🛒</span>
                <span>Cart</span>
                {totalCount > 0 && (
                  <span
                    style={{
                      backgroundColor: "#10b981",
                      color: "#ffffff",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      padding: "0.1rem 0.45rem",
                      borderRadius: "9999px",
                      lineHeight: 1.2,
                    }}
                  >
                    {totalCount}
                  </span>
                )}
              </button>
            </>
          )}

          {/* Dynamic Authentication State */}
          {isLoading ? (
            <div
              style={{
                display: "inline-block",
                width: "80px",
                height: "36px",
                backgroundColor: "#f1f5f9",
                borderRadius: "8px",
                animation: "pulse 1.5s infinite",
              }}
            />
          ) : isAuthenticated && user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "0.25rem" }}>
              {/* User Profile Pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.35rem 0.75rem",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "9999px",
                  fontSize: "0.85rem",
                  color: "#1e293b",
                }}
                title={user.email}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: isFarmer ? "#ecfdf5" : "#eff6ff",
                    color: isFarmer ? "#059669" : "#2563eb",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {isFarmer ? "🚜" : "🏪"}
                </span>

                <span
                  style={{
                    fontWeight: 600,
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name || "User"}
                </span>

                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "0.15rem 0.45rem",
                    borderRadius: "9999px",
                    backgroundColor: isFarmer ? "#dcfce7" : "#dbeafe",
                    color: isFarmer ? "#15803d" : "#1d4ed8",
                    letterSpacing: "0.03em",
                  }}
                >
                  {isFarmer ? "Farmer" : "Retailer"}
                </span>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                id="navbar-sign-out-btn"
                style={{
                  padding: "0.45rem 0.9rem",
                  backgroundColor: "#ffffff",
                  color: "#ef4444",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "0.25rem" }}>
              <Link
                href="/register"
                className="nav-link"
                style={{
                  padding: "0.45rem 0.9rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "#334155",
                  backgroundColor: "#ffffff",
                  textDecoration: "none",
                }}
              >
                Register
              </Link>
              <Link
                href="/login"
                id="navbar-sign-in-btn"
                style={{
                  padding: "0.45rem 1.1rem",
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  boxShadow: "0 1px 3px rgba(16, 185, 129, 0.3)",
                }}
              >
                Sign In
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Right Controls: Cart + Hamburger */}
        <div className="mobile-controls" style={{ display: "none", alignItems: "center", gap: "0.75rem" }}>
          {(!isAuthenticated || isRetailer) && (
            <button
              type="button"
              onClick={toggleCart}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.4rem 0.75rem",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                borderRadius: "9999px",
                color: "#065f46",
                fontWeight: 700,
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              <span>🛒</span>
              {totalCount > 0 && (
                <span
                  style={{
                    backgroundColor: "#10b981",
                    color: "#ffffff",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    padding: "0.05rem 0.4rem",
                    borderRadius: "9999px",
                  }}
                >
                  {totalCount}
                </span>
              )}
            </button>
          )}

          {/* Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#334155",
              fontSize: "1.25rem",
              cursor: "pointer",
            }}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer / Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-dropdown"
          style={{
            backgroundColor: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            padding: "1rem 1.5rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          {isAuthenticated && user && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>{isFarmer ? "🚜" : "🏪"}</span>
              <div style={{ flex: 1 }}>
                <strong style={{ display: "block", fontSize: "0.9rem", color: "#0f172a" }}>
                  {user.name || "User"}
                </strong>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {user.email} • {isFarmer ? "Farmer" : "Retailer"}
                </span>
              </div>
            </div>
          )}

          {/* Farmer Mobile Links */}
          {isAuthenticated && isFarmer && (
            <>
              <Link
                href="/farmer/dashboard"
                style={{ padding: "0.6rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", textDecoration: "none" }}
              >
                🚜 My Produce Dashboard
              </Link>
              <Link
                href="/farmer/listings"
                style={{ padding: "0.6rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", textDecoration: "none" }}
              >
                📋 My Listings
              </Link>
              <Link
                href="/farmer/stock"
                style={{ padding: "0.6rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", textDecoration: "none" }}
              >
                📦 Manage Stock
              </Link>
              <Link
                href="/farmer/orders"
                style={{ padding: "0.6rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", textDecoration: "none" }}
              >
                🛍️ Retail Orders
              </Link>
              <Link
                href="/farmer/add-produce"
                style={{ padding: "0.6rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#16a34a", textDecoration: "none" }}
              >
                🌱 Add Produce Listing
              </Link>
              <Link
                href="/farmer/analytics"
                style={{ padding: "0.6rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", textDecoration: "none" }}
              >
                📊 Farm Analytics
              </Link>
              <Link
                href="/farmer/profile"
                style={{ padding: "0.6rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", textDecoration: "none" }}
              >
                🧑‍🌾 Farm Profile
              </Link>
            </>
          )}

          {/* Retailer / Guest Mobile Links */}
          {(!isAuthenticated || isRetailer) && (
            <>
              <Link
                href="/catalogue"
                style={{ padding: "0.6rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", textDecoration: "none" }}
              >
                🛍️ Produce Catalogue
              </Link>
              {isAuthenticated && isRetailer && (
                <Link
                  href="/orders"
                  style={{ padding: "0.6rem 0.5rem", fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", textDecoration: "none" }}
                >
                  📦 My Wholesale Orders
                </Link>
              )}
            </>
          )}

          {/* Mobile Auth Actions */}
          <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}>
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            ) : (
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Link
                  href="/register"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "0.75rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "#334155",
                    textDecoration: "none",
                  }}
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "0.75rem",
                    backgroundColor: "#10b981",
                    color: "#ffffff",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                  }}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
