"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, loginUser, sendOtp, verifyOtp } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"FARMER" | "RETAILER">("RETAILER");
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (step === 1) {
        // Step 1: Send OTP
        await sendOtp(email.trim());
        setStep(2);
      } else {
        // Step 2: Verify OTP and Register
        if (!otp.trim() || otp.length !== 6) {
          setError("Please enter a valid 6-digit OTP.");
          setIsLoading(false);
          return;
        }

        await verifyOtp(email.trim(), otp.trim());

        // 1. Register user
        await registerUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        });

        // 2. Automatically log in upon successful registration
        try {
          const loginRes = await loginUser({
            email: email.trim(),
            password,
          });

          if (loginRes?.data?.token) {
            const { token, user, role: userRole } = loginRes.data;
            login(token, user, userRole);

            if (userRole === "FARMER") {
              router.push("/farmer/dashboard");
            } else {
              router.push("/catalogue");
            }
            return;
          }
        } catch {
          // If auto-login fails, redirect to login page
          router.push("/login");
          return;
        }

        router.push("/login");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        backgroundColor: "#f8fafc",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "2.5rem",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#ecfdf5",
              color: "#10b981",
              fontSize: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            🌾
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              marginBottom: "0.5rem",
            }}
          >
            Create an Account
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Join Ninjacart to source or list wholesale farm produce directly
          </p>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {step === 1 && (
            <>
              {/* Account Role Selector */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: "0.5rem",
                  }}
                >
                  Select Account Type *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => setRole("RETAILER")}
                    style={{
                      padding: "0.85rem",
                      borderRadius: "10px",
                      border: role === "RETAILER" ? "2px solid #10b981" : "1px solid #cbd5e1",
                      backgroundColor: role === "RETAILER" ? "#ecfdf5" : "#ffffff",
                      color: role === "RETAILER" ? "#065f46" : "#475569",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.25rem",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: "1.3rem" }}>🏪</span>
                    <span>Retailer / Buyer</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#64748b" }}>Order fresh produce</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("FARMER")}
                    style={{
                      padding: "0.85rem",
                      borderRadius: "10px",
                      border: role === "FARMER" ? "2px solid #10b981" : "1px solid #cbd5e1",
                      backgroundColor: role === "FARMER" ? "#ecfdf5" : "#ffffff",
                      color: role === "FARMER" ? "#065f46" : "#475569",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.25rem",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: "1.3rem" }}>🚜</span>
                    <span>Farmer / Producer</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#64748b" }}>List & sell harvest</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="register-name"
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.5rem",
                  }}
                >
                  Full Name *
                </label>
                <input
                  id="register-name"
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="register-email"
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.5rem",
                  }}
                >
                  Email address *
                </label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="register-password"
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "0.5rem",
                  }}
                >
                  Password *
                </label>
                <input
                  id="register-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div>
              <div style={{ backgroundColor: "#eff6ff", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
                <p style={{ color: "#1e3a8a", fontSize: "0.875rem", margin: 0 }}>
                  We've sent a 6-digit OTP to <strong>{email}</strong>. Please enter it below to verify your account.
                </p>
              </div>
              <label
                htmlFor="register-otp"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "0.5rem",
                }}
              >
                Verification Code (OTP) *
              </label>
              <input
                id="register-otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "1.25rem",
                  letterSpacing: "0.25rem",
                  textAlign: "center",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  marginTop: "0.5rem",
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Change Email / Back
              </button>
            </div>
          )}

          <button
            type="submit"
            id="register-submit-btn"
            disabled={isLoading}
            style={{
              marginTop: "0.5rem",
              padding: "0.85rem 1.5rem",
              backgroundColor: isLoading ? "#94a3b8" : "#10b981",
              color: "#ffffff",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: isLoading ? "not-allowed" : "pointer",
              border: "none",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
              transition: "background-color 0.2s ease",
            }}
          >
            {isLoading
              ? (step === 1 ? "Sending OTP..." : "Verifying...")
              : (step === 1 ? `Send OTP to Email` : "Verify & Register")}
          </button>
        </form>

        <div style={{ marginTop: "1.75rem", textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#10b981", fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}