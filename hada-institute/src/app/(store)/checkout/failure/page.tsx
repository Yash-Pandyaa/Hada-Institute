import { XCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export const metadata = {
  title: "Payment failed",
};

export default function CheckoutFailurePage() {
  return (
    <div className="container-shell flex min-h-[60vh] items-center justify-center py-10">
      <div className="w-full max-w-lg rounded-lg border bg-white p-6 text-center shadow-sm">
        <XCircle className="mx-auto size-12 text-destructive" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold tracking-normal">
          Payment not completed
        </h1>
        <p className="mt-2 text-muted-foreground">
          No download access was issued. Retry checkout or contact support after
          payment reconciliation.
        </p>
        <ButtonLink className="mt-6" href="/cart">
          Return to cart
        </ButtonLink>
      </div>
    </div>
  );
}
