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
    <div>
      <form action={onSubmit} className="grid gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input autoComplete="email" id="email" name="email" required type="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input autoComplete="current-password" id="password" name="password" required type="password" />
        </div>
        <Button disabled={loading} type="submit" className="cursor-pointer">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      
      <div className="mt-4">
        <div className="text-center text-sm text-muted-foreground">— or —</div>
        <div className="mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => signIn("google", { callbackUrl: "/account/library" })}
            className="w-full flex justify-center items-center gap-2 border border-input cursor-pointer hover:text-accent-foreground"
          >
            {/* Added explicit sizing directly to SVG and removed the buggy wrapper */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 48 48" 
              className="h-5 w-5 shrink-0"
            >
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#34A853" d="M24 38.5c-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48c6.48 0 11.93-2.13 15.89-5.81l-7.59-5.88c-2.11 1.41-4.81 2.19-8.3 2.19z"/>
              <path fill="#4285F4" d="M46.5 24c0-1.65-.15-3.24-.42-4.79H24v9.03h12.75c-.55 2.97-2.22 5.49-4.75 7.18l7.59 5.88C44.03 37.33 46.5 31.22 46.5 24z"/>
              <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.98-6.19z"/>
            </svg>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
