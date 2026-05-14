"use client";

import { ShoppingCart } from "lucide-react";
import { type CartItem, useCart } from "@/components/store/cart-provider";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  product,
  className,
}: {
  product: Omit<CartItem, "quantity">;
  className?: string;
}) {
  const { addItem } = useCart();

  return (
    <Button
      className={className}
      onClick={() => addItem(product)}
      type="button"
    >
      <ShoppingCart className="size-4" aria-hidden />
      Add to cart
    </Button>
  );
}
