import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata = {
  title: "Create account",
};

export default function SignUpPage() {
  return (
    <div className="container-shell flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-normal">Create account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the same account for checkout and future downloads.
        </p>
        <div className="mt-6">
          <SignUpForm />
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          Already registered?{" "}
          <Link className="font-medium text-primary" href="/auth/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
