"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";

export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setLoading(false);
      toast({
        title: "Could not create account",
        description: data.error || "Please check the form details.",
        variant: "destructive",
      });
      return;
    }

    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    setLoading(false);
    router.push("/account/library");
    router.refresh();
  }

  return (
    <div>
      <form action={onSubmit} className="grid gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input autoComplete="name" id="name" name="name" required />
        </div>
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
          <Label htmlFor="phone">Phone</Label>
          <Input autoComplete="tel" id="phone" name="phone" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            autoComplete="new-password"
            id="password"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </div>
        <Button disabled={loading} type="submit">
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="mt-4">
        <div className="text-center text-sm text-muted-foreground">— or —</div>
        <div className="mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              signIn("google", { callbackUrl: "/account/library" })
            }
          >
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
