import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[260px_1fr]">
      <AdminSidebar />
      <div>
        <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
          <div className="admin-shell flex h-16 items-center justify-between gap-4">
            <Link className="font-semibold text-primary" href="/">
              View storefront
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {session.user.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </header>
        <main className="admin-shell py-6">{children}</main>
      </div>
    </div>
  );
}
