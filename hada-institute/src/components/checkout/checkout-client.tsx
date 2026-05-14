"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useCart } from "@/components/store/cart-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { formatCurrency } from "@/lib/utils";

type CreateOrderResponse = {
  key: string;
  order: {
    id: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
  };
};

export function CheckoutClient() {
  const { data: session, status } = useSession();
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function loadRazorpay() {
    if (window.Razorpay) {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function onSubmit(formData: FormData) {
    if (items.length === 0) {
      return;
    }

    setLoading(true);
    const response = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        couponCode: formData.get("couponCode"),
        billingName: formData.get("billingName"),
        billingEmail: formData.get("billingEmail"),
        billingPhone: formData.get("billingPhone"),
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setLoading(false);
      toast({
        title: "Checkout blocked",
        description: data.error || "Unable to create payment order.",
        variant: "destructive",
      });
      return;
    }

    const data = (await response.json()) as CreateOrderResponse;
    const scriptReady = await loadRazorpay();

    if (!scriptReady || !window.Razorpay) {
      setLoading(false);
      toast({
        title: "Payment unavailable",
        description: "Razorpay checkout script could not load.",
        variant: "destructive",
      });
      return;
    }

    const checkout = new window.Razorpay({
      key: data.key,
      amount: data.order.amount,
      currency: data.order.currency,
      name: "Digital Notes",
      description: "Secure notes purchase",
      order_id: data.order.razorpayOrderId,
      prefill: {
        name: String(formData.get("billingName") || ""),
        email: String(formData.get("billingEmail") || ""),
        contact: String(formData.get("billingPhone") || ""),
      },
      theme: { color: "#0f766e" },
      handler: async (payment) => {
        const verify = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.order.id,
            razorpayOrderId: payment.razorpay_order_id,
            razorpayPaymentId: payment.razorpay_payment_id,
            razorpaySignature: payment.razorpay_signature,
          }),
        });

        if (!verify.ok) {
          setLoading(false);
          router.push("/checkout/failure");
          return;
        }

        clearCart();
        router.push(`/checkout/success?orderId=${data.order.id}`);
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    });

    checkout.on("payment.failed", () => {
      setLoading(false);
      router.push("/checkout/failure");
    });
    checkout.open();
  }

  if (status === "loading") {
    return <div className="container-shell py-10">Loading checkout...</div>;
  }

  if (!session) {
    return (
      <div className="container-shell py-10">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-normal">
            Sign in required
          </h1>
          <p className="mt-2 text-muted-foreground">
            Purchases are linked to your student account so downloads remain
            secure.
          </p>
          <ButtonLink
            className="mt-5"
            href="/auth/sign-in?callbackUrl=/checkout"
          >
            Sign in to checkout
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shell grid gap-6 py-8 lg:grid-cols-[1fr_360px]">
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold tracking-normal">Checkout</h1>
        <form action={onSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="billingName">Billing name</Label>
              <Input
                defaultValue={session.user?.name ?? ""}
                id="billingName"
                name="billingName"
                required
              />
            </div>
            <div>
              <Label htmlFor="billingEmail">Billing email</Label>
              <Input
                defaultValue={session.user?.email ?? ""}
                id="billingEmail"
                name="billingEmail"
                required
                type="email"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="billingPhone">Phone</Label>
              <Input id="billingPhone" name="billingPhone" required />
            </div>
            <div>
              <Label htmlFor="couponCode">Coupon</Label>
              <Input id="couponCode" name="couponCode" placeholder="Optional" />
            </div>
          </div>
          <Button
            disabled={loading || items.length === 0}
            size="lg"
            type="submit"
          >
            {loading ? "Opening Razorpay..." : "Pay securely"}
          </Button>
        </form>
      </section>
      <aside className="h-fit rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Summary</h2>
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <div
              className="flex justify-between gap-3 text-sm"
              key={item.productId}
            >
              <span className="text-muted-foreground">
                {item.title} x {item.quantity}
              </span>
              <span className="font-semibold">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t pt-4 font-bold">
          <span>Total</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      </aside>
    </div>
  );
}
