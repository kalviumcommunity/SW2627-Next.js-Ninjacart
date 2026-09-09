"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  produceId: string;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  minOrderQuantity: number;
  unit: string;
  imagePublicId?: string;
  farmerId: string;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (produceId: string) => void;
  updateQuantity: (produceId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ninjacart_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse cart from local storage", e);
    }
    setIsInitialized(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("ninjacart_cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.produceId === newItem.produceId);
      if (existing) {
        // Update quantity, ensuring we don't exceed maxQuantity
        const updatedQuantity = Math.min(existing.quantity + newItem.quantity, existing.maxQuantity);
        return prev.map((item) =>
          item.produceId === newItem.produceId ? { ...item, quantity: updatedQuantity } : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (produceId: string) => {
    setItems((prev) => prev.filter((item) => item.produceId !== produceId));
  };

  const updateQuantity = (produceId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.produceId === produceId) {
          // Clamp quantity between minOrderQuantity and maxQuantity
          const clamped = Math.max(item.minOrderQuantity, Math.min(quantity, item.maxQuantity));
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
