import { BookOpen, LayoutDashboard, Menu, UserRound } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { CartLink } from "@/components/store/cart-link";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { authOptions } from "@/lib/auth";

const navItems = [
  { href: "/marketplace", label: "Notes" },
  { href: "/categories", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/92 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link className="flex items-center gap-2 font-bold" href="/">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-white">
            <BookOpen className="size-5" aria-hidden />
          </span>
          <span>{siteConfig.shortName}</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <CartLink />
          {session?.user ? (
            <ButtonLink href="/account/library" variant="outline">
              <UserRound className="size-4" aria-hidden />
              <span className="hidden sm:inline">Account</span>
            </ButtonLink>
          ) : (
            <ButtonLink href="/auth/sign-in" variant="outline">
              Sign in
            </ButtonLink>
          )}
          {session?.user.role === "ADMIN" ? (
            <ButtonLink href="/admin" variant="secondary">
              <LayoutDashboard className="size-4" aria-hidden />
              <span className="hidden sm:inline">Admin</span>
            </ButtonLink>
          ) : null}
          <button
            aria-label="Open navigation menu"
            className="inline-flex size-10 items-center justify-center rounded-lg border bg-white lg:hidden"
            type="button"
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
}
