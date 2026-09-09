"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";
import { getProduceById, Produce } from "@/lib/api";

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const [wishlistedProducts, setWishlistedProducts] = useState<Produce[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        const products = await Promise.all(
          wishlistIds.map(async (id) => {
            const product = await getProduceById(id);
            return product;
          })
        );
        
        // Filter out nulls if a product was deleted
        setWishlistedProducts(products.filter((p): p is Produce => p !== null));
      } catch (error) {
        console.error("Failed to fetch wishlist products", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [wishlistIds]);

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: "1440px", padding: "2rem 1.5rem", margin: "0 auto", minHeight: "80vh" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "2rem", color: "#0f172a" }}>Your Wishlist</h1>
      
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div style={{ display: "inline-block", width: "40px", height: "40px", borderRadius: "50%", border: "4px solid #e2e8f0", borderTopColor: "#10b981", animation: "spin 1s linear infinite" }} />
        </div>
      ) : wishlistedProducts.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "4rem 2rem", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>❤️</div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>Your wishlist is empty</h3>
          <p style={{ color: "#64748b", fontSize: "1rem", marginBottom: "2rem", lineHeight: 1.5 }}>Save items you're interested in for later.</p>
          <Link href="/catalogue" style={{ display: "inline-block", padding: "0.8rem 2rem", backgroundColor: "#16a34a", color: "#ffffff", fontWeight: 600, borderRadius: "8px", textDecoration: "none" }}>
            Browse Catalogue
          </Link>
        </div>
      ) : (
        <div className="catalogue-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
          {wishlistedProducts.map((produce) => (
            <ProductCard key={produce.id} produce={produce} />
          ))}
        </div>
      )}
    </div>
  );
}
