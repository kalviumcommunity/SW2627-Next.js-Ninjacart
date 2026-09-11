"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { verifyOtp } from "@/lib/api";

export default function VerifyOtpPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter the email address.");
      return;
    }

    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await verifyOtp(email.trim(), otp.trim());
      setSuccess(true);

      // In a real standalone flow, we might redirect to a success page or login.
      // Since this is a reusable/standalone UI (as registration uses the inline flow),
      // we'll just show a success message.
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid or expired OTP.";
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
          maxWidth: "460px",
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
              backgroundColor: "#eff6ff",
              color: "#3b82f6",
              fontSize: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            ✉️
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
            OTP Verification
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Enter the 6-digit code sent to your email
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

        {success && (
          <div
            role="alert"
            style={{
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#059669",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>✅</span>
            <span>OTP verified successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Email Context */}
          <div>
            <label
              htmlFor="verify-email"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "0.5rem",
              }}
            >
              Email Address
            </label>
            <input
              id="verify-email"
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
                backgroundColor: "#f8fafc",
              }}
            />
          </div>

          {/* OTP Input */}
          <div>
            <label
              htmlFor="verify-otp"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "0.5rem",
              }}
            >
              Verification Code (OTP)
            </label>
            <input
              id="verify-otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only allow digits
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
                fontWeight: 700,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || success}
            style={{
              marginTop: "0.5rem",
              padding: "0.85rem 1.5rem",
              backgroundColor: (isLoading || success) ? "#94a3b8" : "#3b82f6",
              color: "#ffffff",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: (isLoading || success) ? "not-allowed" : "pointer",
              border: "none",
              boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
              transition: "background-color 0.2s ease",
            }}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div style={{ marginTop: "1.75rem", textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>
          Return to{" "}
          <Link href="/register" style={{ color: "#3b82f6", fontWeight: 600 }}>
            Registration
          </Link>
          {" "}or{" "}
          <Link href="/login" style={{ color: "#3b82f6", fontWeight: 600 }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
