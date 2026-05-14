"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/store/cart-provider";

export function CartLink() {
  const { count } = useCart();

  return (
    <Link
      aria-label="Open cart"
      className="relative inline-flex size-10 items-center justify-center rounded-lg border bg-white text-foreground shadow-sm transition hover:bg-muted"
      href="/cart"
    >
      <ShoppingBag className="size-5" aria-hidden />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
