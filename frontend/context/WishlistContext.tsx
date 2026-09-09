"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (produceId: string) => void;
  isInWishlist: (produceId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ninjacart_wishlist");
      if (stored) {
        setWishlistIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse wishlist from local storage", e);
    }
    setIsInitialized(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("ninjacart_wishlist", JSON.stringify(wishlistIds));
    }
  }, [wishlistIds, isInitialized]);

  const toggleWishlist = (produceId: string) => {
    setWishlistIds((prev) => {
      if (prev.includes(produceId)) {
        return prev.filter((id) => id !== produceId);
      } else {
        return [...prev, produceId];
      }
    });
  };

  const isInWishlist = (produceId: string) => {
    return wishlistIds.includes(produceId);
  };

  const value: WishlistContextType = {
    wishlistIds,
    toggleWishlist,
    isInWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
