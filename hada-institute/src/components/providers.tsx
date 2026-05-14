"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/store/cart-provider";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
    </SessionProvider>
  );
}
