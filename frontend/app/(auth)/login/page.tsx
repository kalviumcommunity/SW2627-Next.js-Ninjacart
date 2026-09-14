"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { loginUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setMessageType("");
    if (!email.trim() || !password) {
      setMessage("Email and password are required.");
      setMessageType("error");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await loginUser({ email: email.trim(), password });
      const role = result?.data?.role;
      const user = result?.data?.user;
      const token = result?.data?.token;
      if (!token || !user || (role !== "FARMER" && role !== "RETAILER")) {
        throw new Error("Login succeeded, but the account role is not recognized.");
      }
      login(token, user, role);
      setMessage("Login successful.");
      setMessageType("success");
      router.push(role === "FARMER" ? "/farmer/dashboard" : "/catalogue");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to log in.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Link href="/" className="auth-brand" aria-label="Ninjacart home">
          <img src="/ninjacart_logo.png" alt="Ninjacart" className="auth-logo" />
        </Link>
        <div className="auth-heading">
          <p className="auth-eyebrow">Welcome back</p>
          <h1>Sign in to Ninjacart</h1>
          <p>Access your produce marketplace account.</p>
        </div>
        <div className="auth-fields">
          <div className="field-group">
            <label htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Enter your password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
        </div>
        <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}</button>
        {message && <p className={`auth-message ${messageType}`} role="alert">{message}</p>}
        <p className="auth-footer">New to Ninjacart? <Link href="/register">Create an account</Link></p>
      </form>
    </div>
  );
}