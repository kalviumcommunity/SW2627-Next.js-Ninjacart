"use client";

import Link from "next/link";
import { useState } from "react";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setMessageType("");
    if (!name.trim() || !email.trim() || !password || !role.trim()) {
      setMessage("Name, email, password, and role are required.");
      setMessageType("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage("Enter a valid email address.");
      setMessageType("error");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setMessageType("error");
      return;
    }
    setIsSubmitting(true);
    try {
      await registerUser({ name: name.trim(), email: email.trim(), password, role });
      setMessage("Registration successful. You can now log in.");
      setMessageType("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to register.");
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
          <p className="auth-eyebrow">Ninjacart account</p>
          <h1>Create your account</h1>
          <p>Join the farm-to-retail marketplace as a farmer or retailer.</p>
        </div>
        <div className="auth-fields">
          <div className="field-group"><label htmlFor="name">Full name</label><input id="name" name="name" type="text" placeholder="Enter your full name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required /></div>
          <div className="field-group"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" autoComplete="new-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
            </div>
          </div>
          <div className="field-group"><label htmlFor="role">Account type</label><select id="role" name="role" value={role} onChange={(event) => setRole(event.target.value)} required><option value="" disabled>Select your account type</option><option value="FARMER">Farmer</option><option value="RETAILER">Retailer</option></select></div>
        </div>
        <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create account"}</button>
        {message && <p className={`auth-message ${messageType}`} role="alert">{message}</p>}
        <p className="auth-footer">Already have an account? <Link href="/login">Sign in</Link></p>
      </form>
    </div>
  );
}