import { BookOpen, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const hasContact =
    Boolean(siteConfig.supportEmail) ||
    Boolean(siteConfig.supportPhone) ||
    Boolean(siteConfig.address);

  return (
    <footer className="border-t bg-slate-950 text-slate-200">
      <div className="container-shell grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="flex size-9 items-center justify-center rounded-lg bg-teal-500 text-white">
              <BookOpen className="size-5" aria-hidden />
            </span>
            {siteConfig.name}
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            {siteConfig.description}
          </p>
          {!hasContact ? (
            <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
              Official contact details are hidden until verified data is added.
            </p>
          ) : null}
        </div>
        <div>
          <h3 className="font-semibold text-white">Marketplace</h3>
          <div className="mt-4 grid gap-2 text-sm text-slate-400">
            <Link href="/marketplace">Browse notes</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/account/library">My library</Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-white">Institute</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-400">
            {siteConfig.supportEmail ? (
              <span className="flex items-center gap-2">
                <Mail className="size-4" aria-hidden />
                {siteConfig.supportEmail}
              </span>
            ) : null}
            {siteConfig.supportPhone ? (
              <span className="flex items-center gap-2">
                <Phone className="size-4" aria-hidden />
                {siteConfig.supportPhone}
              </span>
            ) : null}
            {siteConfig.address ? (
              <span className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden />
                {siteConfig.address}
              </span>
            ) : null}
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <p className="container-shell text-xs text-slate-500">
          Copyright {new Date().getFullYear()} {siteConfig.name}. Digital notes
          are licensed to the purchasing student account.
        </p>
      </div>
    </footer>
  );
}
