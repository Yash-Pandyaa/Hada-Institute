"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/store/cart-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";

export function CartPageClient() {
  const { items, subtotal, removeItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-shell py-10">
        <EmptyState
          description="Add notes from the marketplace before starting checkout."
          title="Your cart is empty"
        />
      </div>
    );
  }

  return (
    <div className="container-shell grid gap-6 py-8 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold tracking-normal">Cart</h1>
        <div className="mt-5 grid gap-4">
          {items.map((item) => (
            <div
              className="grid gap-4 rounded-lg border p-3 sm:grid-cols-[112px_1fr_auto]"
              key={item.productId}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  src={item.thumbnailUrl}
                />
              </div>
              <div>
                <Link
                  className="font-semibold hover:text-primary"
                  href={`/notes/${item.slug}`}
                >
                  {item.title}
                </Link>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatCurrency(item.price)} each
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    aria-label="Decrease quantity"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Minus className="size-4" aria-hidden />
                  </Button>
                  <span className="flex h-10 min-w-12 items-center justify-center rounded-lg border px-3 text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <Button
                    aria-label="Increase quantity"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Plus className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>
              <div className="flex items-start justify-between gap-4 sm:block sm:text-right">
                <p className="font-bold">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                <Button
                  aria-label="Remove item"
                  className="mt-3"
                  onClick={() => removeItem(item.productId)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <aside className="h-fit rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <div className="mt-4 flex justify-between border-b pb-4 text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">{formatCurrency(subtotal)}</span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Coupons and final payment verification are handled securely during
          checkout.
        </p>
        <ButtonLink className="mt-5 w-full" href="/checkout" size="lg">
          Continue to checkout
        </ButtonLink>
      </aside>
    </div>
  );
}
