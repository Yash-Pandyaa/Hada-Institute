"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
      variant="outline"
    >
      <LogOut className="size-4" aria-hidden />
      Sign out
    </Button>
  );
}
