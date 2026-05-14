"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ToastProvider, useToast } from "@/components/ui/toaster";

export type CartItem = {
  productId: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  price: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "hada-notes-cart";

function CartStateProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      setItems(JSON.parse(stored) as CartItem[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((current) => {
        const existing = current.find(
          (cartItem) => cartItem.productId === item.productId,
        );

        if (existing) {
          return current.map((cartItem) =>
            cartItem.productId === item.productId
              ? {
                  ...cartItem,
                  quantity: Math.min(cartItem.quantity + quantity, 10),
                }
              : cartItem,
          );
        }

        return [...current, { ...item, quantity }];
      });
      toast({
        title: "Added to cart",
        description: item.title,
      });
    },
    [toast],
  );

  const removeItem = useCallback((productId: string) => {
    setItems((current) =>
      current.filter((cartItem) => cartItem.productId !== productId),
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current.map((cartItem) =>
        cartItem.productId === productId
          ? { ...cartItem, quantity: Math.max(1, Math.min(quantity, 10)) }
          : cartItem,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      subtotal: items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
      count: items.reduce((total, item) => total + item.quantity, 0),
    }),
    [addItem, clearCart, items, removeItem, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function CartProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CartStateProvider>{children}</CartStateProvider>
    </ToastProvider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
