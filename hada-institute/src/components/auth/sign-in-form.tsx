"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
      callbackUrl: searchParams.get("callbackUrl") || "/account/library",
    });
    setLoading(false);

    if (result?.error) {
      toast({
        title: "Sign in failed",
        description: "Check your email and password.",
        variant: "destructive",
      });
      return;
    }

    router.push(result?.url || "/account/library");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          autoComplete="email"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          autoComplete="current-password"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>
      <Button disabled={loading} type="submit">
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
