"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, role, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  const isFarmer = (role || user?.role) === "FARMER";

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link href="/" className="logo-brand">
          <span className="logo-badge">🌾 NINJAKART</span>
          <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#64748b" }}>
            Direct-to-Retail
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-links">
          <Link
            href="/catalogue"
            className={`nav-link ${pathname === "/catalogue" ? "active" : ""}`}
          >
            🛍️ Produce Catalogue
          </Link>

          <Link
            href="/farmer/dashboard"
            className={`nav-link ${pathname.startsWith("/farmer") ? "active" : ""}`}
          >
            🚜 Farmer Portal
          </Link>

          <Link
            href="/orders"
            className={`nav-link ${pathname === "/orders" ? "active" : ""}`}
          >
            📦 Orders
          </Link>

          {/* Dynamic Authentication State (BUG-010 Fix) */}
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

                <span style={{ fontWeight: 600, maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#fef2f2";
                  e.currentTarget.style.borderColor = "#ef4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.borderColor = "#fecaca";
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
                  boxShadow: "0 1px 3px rgba(16, 185, 129, 0.3)",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#059669";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#10b981";
                }}
              >
                Sign In
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
