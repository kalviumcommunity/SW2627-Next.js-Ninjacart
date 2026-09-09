"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getProduces, updateProduce, Produce } from "@/lib/api";

export default function FarmerDashboardPage() {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const effectiveRole = role || user?.role;
  const [myProduces, setMyProduces] = useState<Produce[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated && effectiveRole === "FARMER" && (user as any)?.farmerId) {
      getProduces({ farmerId: (user as any).farmerId, limit: 100 })
        .then(data => setMyProduces(data.produces || []))
        .catch(err => console.error("Failed to fetch farmer produce:", err))
        .finally(() => setIsFetching(false));
    } else {
      setIsFetching(false);
    }
  }, [isAuthenticated, effectiveRole, user]);

  const handleUpdateQuantity = async (id: string) => {
    try {
      await updateProduce(id, { quantity: editQuantity });
      setMyProduces(prev => prev.map(p => p.id === id ? { ...p, quantity: editQuantity } : p));
      setEditingId(null);
    } catch (err) {
      alert("Failed to update quantity");
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this listing? It will no longer be visible to retailers.")) return;
    try {
      await updateProduce(id, { status: "ARCHIVED" });
      setMyProduces(prev => prev.map(p => p.id === id ? { ...p, status: "ARCHIVED" } : p));
    } catch (err) {
      alert("Failed to archive listing");
    }
  };

  const totalListings = myProduces.length;
  const activeListings = myProduces.filter(p => p.status !== "ARCHIVED").length;
  const outOfStockListings = myProduces.filter(p => p.status === "OUT_OF_STOCK" || p.quantity === 0).length;

  if (isLoading || isFetching) {
    return (
      <div style={{ maxWidth: "800px", margin: "3rem auto", padding: "2rem", textAlign: "center" }}>
        <div style={{ display: "inline-block", width: "48px", height: "48px", border: "4px solid #e2e8f0", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: "1rem", color: "#64748b" }}>Loading Dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated || effectiveRole !== "FARMER") {
    return (
      <div style={{ maxWidth: "540px", margin: "4rem auto", padding: "2.5rem", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1.25rem" }}>🚜</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>Farmer Portal Access</h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>You must be logged in as a verified farmer to access this portal.</p>
        <Link href="/login" style={{ padding: "0.85rem 1.5rem", backgroundColor: "#10b981", color: "#ffffff", borderRadius: "10px", fontWeight: 700, textDecoration: "none" }}>Sign In to Account</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1.5rem 4rem" }}>
      {/* Dashboard Banner */}
      <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)", borderRadius: "20px", padding: "2.5rem 2rem", color: "#ffffff", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Welcome, {user?.name || "Farmer"}!</h1>
          <p style={{ color: "#d1fae5", fontSize: "0.95rem", maxWidth: "540px" }}>Manage your harvest listings, set wholesale prices, and connect directly with retail buyers across India.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/farmer/add-produce" style={{ padding: "0.85rem 1.5rem", backgroundColor: "#ffffff", color: "#065f46", borderRadius: "10px", fontWeight: 700, textDecoration: "none" }}>+ List New Produce</Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.5rem" }}>📦</span>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Total Listings</span>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>{totalListings}</h3>
        </div>
        <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.5rem" }}>✅</span>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Active (In Stock)</span>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#10b981", marginTop: "0.25rem" }}>{activeListings - outOfStockListings}</h3>
        </div>
        <div style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.5rem" }}>⚠️</span>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Out of Stock</span>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#ef4444", marginTop: "0.25rem" }}>{outOfStockListings}</h3>
        </div>
      </div>

      {/* Inventory Management Table */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "2rem", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.5rem" }}>My Inventory</h2>
        
        {myProduces.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <p style={{ color: "#64748b", marginBottom: "1rem" }}>You haven't listed any produce yet.</p>
            <Link href="/farmer/add-produce" style={{ padding: "0.6rem 1.2rem", backgroundColor: "#10b981", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: 600 }}>Create First Listing</Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b", fontSize: "0.875rem", textAlign: "left" }}>
                  <th style={{ padding: "1rem" }}>Produce</th>
                  <th style={{ padding: "1rem" }}>Category</th>
                  <th style={{ padding: "1rem" }}>Price</th>
                  <th style={{ padding: "1rem" }}>Quantity</th>
                  <th style={{ padding: "1rem" }}>Status</th>
                  <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myProduces.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "6px", backgroundColor: "#f8fafc", overflow: "hidden" }}>
                          <img src={p.imageUrl || "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80"} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "1rem", color: "#475569" }}>{p.category}</td>
                    <td style={{ padding: "1rem", color: "#475569" }}>₹{p.price}/{p.unit}</td>
                    <td style={{ padding: "1rem" }}>
                      {editingId === p.id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <input type="number" min="0" value={editQuantity} onChange={(e) => setEditQuantity(Number(e.target.value))} style={{ width: "80px", padding: "0.4rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                          <button onClick={() => handleUpdateQuantity(p.id)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>Save</button>
                          <button onClick={() => setEditingId(null)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontWeight: 600, color: p.quantity === 0 ? "#ef4444" : "#1e293b" }}>{p.quantity} {p.unit}</span>
                          {p.status !== "ARCHIVED" && (
                            <button onClick={() => { setEditingId(p.id); setEditQuantity(p.quantity); }} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}>Edit</button>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, backgroundColor: p.status === "ARCHIVED" ? "#f1f5f9" : p.status === "AVAILABLE" ? "#dcfce7" : p.status === "OUT_OF_STOCK" ? "#fee2e2" : "#fef3c7", color: p.status === "ARCHIVED" ? "#475569" : p.status === "AVAILABLE" ? "#16a34a" : p.status === "OUT_OF_STOCK" ? "#ef4444" : "#d97706" }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      {p.status !== "ARCHIVED" ? (
                        <button onClick={() => handleArchive(p.id)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>Archive</button>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
