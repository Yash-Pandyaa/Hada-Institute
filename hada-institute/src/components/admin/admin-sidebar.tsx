import {
  BarChart3,
  BookOpen,
  FileText,
  Images,
  LayoutDashboard,
  MessageSquare,
  ReceiptIndianRupee,
  ShoppingBag,
  Tags,
  TicketPercent,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/orders", label: "Orders", icon: ReceiptIndianRupee },
  { href: "/admin/users", label: "Users", icon: UsersRound },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/banners", label: "Banners", icon: Images },
  { href: "/admin/testimonials", label: "Reviews", icon: MessageSquare },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/payments", label: "Payments", icon: BarChart3 },
];

export function AdminSidebar() {
  return (
    <aside className="hidden min-h-screen border-r bg-slate-950 text-slate-200 lg:block">
      <div className="sticky top-0 p-5">
        <Link
          className="flex items-center gap-2 font-bold text-white"
          href="/admin"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-teal-500">
            {siteConfig.shortName.slice(0, 1)}
          </span>
          Admin
        </Link>
        <nav className="mt-8 grid gap-1">
          {items.map((item) => (
            <Link
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
              href={item.href}
              key={item.href}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
