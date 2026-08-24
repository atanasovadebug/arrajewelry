import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FREE_SHIPPING_THRESHOLD_BGN, SHIPPING_COST_OFFICE_BGN, SHIPPING_COST_AUTOMAT_BGN, SHIPPING_COST_ADDRESS_BGN } from "@/lib/currency";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  category?: string;
  maxStock?: number;
}

export type ShippingMethod = "office" | "automat" | "address";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  shippingMethod: ShippingMethod;
  setShippingMethod: (method: ShippingMethod) => void;
  total: number;
}


const CartContext = createContext<CartContextType | undefined>(undefined);

function getSessionId(): string {
  let sessionId = localStorage.getItem("cart_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("cart_session_id", sessionId);
  }
  return sessionId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("office");

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart_items");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "id">): boolean => {
    // Match by productId AND name (name includes size/color variant info)
    const existing = items.find((i) => i.productId === item.productId && i.name === item.name);
    const max = item.maxStock ?? existing?.maxStock ?? Infinity;
    const currentQty = existing?.quantity ?? 0;
    const nextQty = Math.min(currentQty + item.quantity, max);

    if (nextQty <= currentQty) return false;

    setItems((prev) => {
      const found = prev.find((i) => i.productId === item.productId && i.name === item.name);
      if (found) {
        return prev.map((i) =>
          i.productId === item.productId && i.name === item.name
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, max), maxStock: item.maxStock ?? i.maxStock }
            : i
        );
      }
      return [...prev, { ...item, quantity: nextQty, id: crypto.randomUUID() }];
    });
    return true;
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(quantity, i.maxStock ?? Infinity) }
          : i
      )
    );
  };


  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("cart_items");
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const baseShippingCost = shippingMethod === "automat" ? SHIPPING_COST_AUTOMAT_BGN : shippingMethod === "address" ? SHIPPING_COST_ADDRESS_BGN : SHIPPING_COST_OFFICE_BGN;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD_BGN ? 0 : baseShippingCost;
  const total = subtotal + shippingCost;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        shippingCost,
        shippingMethod,
        setShippingMethod,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
