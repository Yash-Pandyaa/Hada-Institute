import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export const metadata = {
  title: "Payment success",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="container-shell flex min-h-[60vh] items-center justify-center py-10">
      <div className="w-full max-w-lg rounded-lg border bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-12 text-primary" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold tracking-normal">
          Payment verified
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your secure download access has been created. You can find purchased
          notes in your library.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/account/library">Open library</ButtonLink>
          <Link
            className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-primary"
            href="/account/orders"
          >
            View orders
          </Link>
        </div>
      </div>
    </div>
  );
}
