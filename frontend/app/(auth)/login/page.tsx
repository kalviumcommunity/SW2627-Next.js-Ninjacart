"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });
      
      if (response.success) {
        login(response.data.user, response.data.token);
        if (response.data.user.role === "FARMER") {
          router.push("/farmer/dashboard");
        } else {
          router.push("/catalogue");
        }
      } else {
        setError(response.error || "Failed to login");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div 
        className="auth-sidebar" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}
      >
        <div className="auth-sidebar-content">
          <h1>Farm fresh produce, directly to your retail store.</h1>
          <p>Join the Ninjacart network to experience the most transparent and efficient agricultural supply chain.</p>
        </div>
      </div>
      
      <div className="auth-form-wrapper">
        <div className="auth-form-card">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to your Ninjacart account</p>
          
          {error && (
            <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '0.875rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email" className="input-label">Email Address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label htmlFor="password" className="input-label">Password</label>
              <input
                id="password"
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>
          
          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Don't have an account? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}