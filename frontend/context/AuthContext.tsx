/**
 * ============================================================================
 * Global Authentication Context (Implemented by Jovab)
 * ============================================================================
 * Purpose: Manages user login state, JWT session persistence, and role-based permissions.
 *
 * Flow:
 * 1. Client loads: Checks localStorage for cached JWT token and profile data.
 * 2. Background Revalidation: Calls getMe() (GET /api/auth/me) to sync fresh user data from database.
 * 3. Cross-Tab Sync: Dispatches and listens for 'ninjakart-auth-state-changed' events to keep tabs aligned.
 * 4. Provides global auth helpers (login, logout, refreshUser) and reactive role state (FARMER / RETAILER).
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe } from "@/lib/api";

export interface FarmerProfile {
  id: string;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
}

export interface RetailerProfile {
  id: string;
  storeName?: string | null;
  phone?: string | null;
  location?: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  farmer?: FarmerProfile | null;
  retailer?: RetailerProfile | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthUser, role?: string) => void;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_EVENT_NAME = "ninjakart-auth-state-changed";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuthFromStorage = useCallback(async () => {
    try {
      if (typeof window === "undefined") return;

      const storedToken = localStorage.getItem("token");
      const storedUserRaw = localStorage.getItem("user");
      const storedRole = localStorage.getItem("role");

      if (storedToken) {
        setToken(storedToken);

        let parsedUser: AuthUser | null = null;
        if (storedUserRaw) {
          try {
            parsedUser = JSON.parse(storedUserRaw);
          } catch {
            parsedUser = null;
          }
        }

        const effectiveRole = storedRole || parsedUser?.role || null;
        if (parsedUser) {
          setUser({ ...parsedUser, role: effectiveRole || parsedUser.role });
        } else {
          setUser({ id: "user", name: "User", email: "", role: effectiveRole || undefined });
        }
        setRole(effectiveRole);

        // Synchronize in background with live server profile
        try {
          const liveUser = await getMe();
          if (liveUser) {
            const mergedUser: AuthUser = {
              id: liveUser.id,
              name: liveUser.name,
              email: liveUser.email,
              role: liveUser.role || effectiveRole,
              farmer: liveUser.farmer,
              retailer: liveUser.retailer,
            };
            setUser(mergedUser);
            setRole(mergedUser.role || effectiveRole);
            localStorage.setItem("user", JSON.stringify(mergedUser));
            if (mergedUser.role) localStorage.setItem("role", mergedUser.role);
          }
        } catch {
          // Keep cached session if offline
        }
      } else {
        setToken(null);
        setUser(null);
        setRole(null);
      }
    } catch {
      setToken(null);
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuthFromStorage();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user" || e.key === "role") {
        loadAuthFromStorage();
      }
    };

    const handleCustomAuth = () => {
      loadAuthFromStorage();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_EVENT_NAME, handleCustomAuth);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_EVENT_NAME, handleCustomAuth);
    };
  }, [loadAuthFromStorage]);

  const refreshUser = async (): Promise<AuthUser | null> => {
    try {
      const liveUser = await getMe();
      if (liveUser) {
        const mergedUser: AuthUser = {
          id: liveUser.id,
          name: liveUser.name,
          email: liveUser.email,
          role: liveUser.role || role || undefined,
          farmer: liveUser.farmer,
          retailer: liveUser.retailer,
        };
        setUser(mergedUser);
        if (mergedUser.role) {
          setRole(mergedUser.role);
          localStorage.setItem("role", mergedUser.role);
        }
        localStorage.setItem("user", JSON.stringify(mergedUser));
        window.dispatchEvent(new Event(AUTH_EVENT_NAME));
        return mergedUser;
      }
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }
    return user;
  };

  const login = (newToken: string, newUser: AuthUser, explicitRole?: string) => {
    try {
      const resolvedRole = explicitRole || newUser.role || "RETAILER";
      const fullUser = { ...newUser, role: resolvedRole };

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(fullUser));
      localStorage.setItem("role", resolvedRole);

      setToken(newToken);
      setUser(fullUser);
      setRole(resolvedRole);

      window.dispatchEvent(new Event(AUTH_EVENT_NAME));
    } catch (err) {
      console.error("Failed to persist auth session:", err);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      setToken(null);
      setUser(null);
      setRole(null);

      window.dispatchEvent(new Event(AUTH_EVENT_NAME));
    } catch (err) {
      console.error("Failed to clear auth session:", err);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    role,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
