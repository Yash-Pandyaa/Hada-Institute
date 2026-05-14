import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <div className="container-shell flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-normal">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Access your orders, downloads, and invoices.
        </p>
        <div className="mt-6">
          <Suspense
            fallback={
              <div className="text-sm text-muted-foreground">
                Loading sign in...
              </div>
            }
          >
            <SignInForm />
          </Suspense>
        </div>
        <div className="mt-5 flex items-center justify-between text-sm">
          <Link
            className="font-medium text-primary"
            href="/auth/forgot-password"
          >
            Forgot password?
          </Link>
          <Link className="font-medium text-primary" href="/auth/sign-up">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
