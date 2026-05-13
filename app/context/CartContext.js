'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart-items');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('[CartContext] Failed to load cart:', e);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart-items', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = useCallback((item, qty = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
        };
        return updated;
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const updateItemQuantity = useCallback((itemId, quantity) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  }, []);

  const removeItem = useCallback((itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const setItemsDirect = useCallback((newItems) => {
    setItems(newItems);
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartTotal = items.reduce((sum, item) => {
    const price = item.price || item.discount_price || 0;
    return sum + price * item.quantity;
  }, 0);

  const value = {
    isEmpty: items.length === 0,
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    cartTotal,
    addItem,
    updateItemQuantity,
    removeItem,
    setItems: setItemsDirect,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};