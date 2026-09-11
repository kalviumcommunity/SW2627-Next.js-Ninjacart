"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Produce } from "@/lib/api";

export interface CartItem {
  id: string;
  produceId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  minOrderQuantity: number;
  availableStock: number;
  imageUrl?: string | null;
  category?: string;
  farmerName?: string;
}

export interface CartContextType {
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (produce: Produce, requestedQuantity?: number) => void;
  removeItem: (produceId: string) => void;
  updateQuantity: (produceId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "ninjacart_cart_items";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load cart items from storage:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (err) {
        console.error("Failed to save cart items to storage:", err);
      }
    }
  }, [items, isLoaded]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const addItem = useCallback((produce: Produce, requestedQuantity?: number) => {
    const minQty = produce.minOrderQuantity || 1;
    const maxQty = produce.quantity;
    const initialQty = requestedQuantity !== undefined ? requestedQuantity : minQty;
    const clampedInitialQty = Math.max(minQty, Math.min(maxQty, initialQty));

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.produceId === produce.id);
      if (existingIndex > -1) {
        const existing = prevItems[existingIndex];
        const newQty = Math.min(produce.quantity, existing.quantity + (requestedQuantity || minQty));
        const updated = [...prevItems];
        updated[existingIndex] = { ...existing, quantity: newQty, availableStock: produce.quantity };
        return updated;
      } else {
        const farmerName = produce.farmer?.user?.name || "Verified Farmer";
        const newItem: CartItem = {
          id: `cart-${produce.id}`,
          produceId: produce.id,
          name: produce.name,
          price: produce.price,
          unit: produce.unit || "kg",
          quantity: clampedInitialQty,
          minOrderQuantity: minQty,
          availableStock: produce.quantity,
          imageUrl: produce.imageUrl,
          category: produce.category,
          farmerName,
        };
        return [...prevItems, newItem];
      }
    });

    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((produceId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.produceId !== produceId));
  }, []);

  const updateQuantity = useCallback((produceId: string, newQuantity: number) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.produceId === produceId) {
            if (newQuantity <= 0) return null;
            const minQty = item.minOrderQuantity || 1;
            const maxQty = item.availableStock;
            const clamped = Math.max(minQty, Math.min(maxQty, newQuantity));
            return { ...item, quantity: clamped };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value: CartContextType = {
    items,
    totalCount,
    totalAmount,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
