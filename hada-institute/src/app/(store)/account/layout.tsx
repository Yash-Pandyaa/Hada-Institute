import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { authOptions } from "@/lib/auth";

const accountNav = [
  { href: "/account/library", label: "Library" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/profile", label: "Profile" },
];

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/account/library");
  }

  return (
    <div className="container-shell grid gap-6 py-8 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-lg border bg-white p-4 shadow-sm">
        <div>
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="mt-1 font-semibold">
            {session.user.name || session.user.email}
          </p>
        </div>
        <nav className="mt-5 grid gap-1">
          {accountNav.map((item) => (
            <Link
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-5">
          <SignOutButton />
        </div>
      </aside>
      <section>{children}</section>
    </div>
  );
}
