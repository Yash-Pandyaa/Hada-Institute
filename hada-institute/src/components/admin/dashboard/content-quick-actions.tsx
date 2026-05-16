import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  FileText,
  Images,
  PlusCircle,
  ShoppingBag,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ContentQuickActions() {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Quick actions</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish faster with one-click shortcuts.
          </p>
        </div>
        <PlusCircle className="size-5 text-muted-foreground" aria-hidden />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <ButtonLink
          href="/admin/blog/new"
          variant="secondary"
          className="justify-start"
        >
          <FileText className="mr-2 size-4" aria-hidden />
          New blog
        </ButtonLink>
        <ButtonLink
          href="/admin/banners/page"
          variant="secondary"
          className="justify-start"
        >
          <Images className="mr-2 size-4" aria-hidden />
          Manage banners
        </ButtonLink>
        <ButtonLink
          href="/admin/products/new"
          variant="secondary"
          className="justify-start"
        >
          <ShoppingBag className="mr-2 size-4" aria-hidden />
          New product
        </ButtonLink>
        <ButtonLink
          href="/admin/subjects"
          variant="secondary"
          className="justify-start"
        >
          <BookOpen className="mr-2 size-4" aria-hidden />
          Manage subjects
        </ButtonLink>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <ButtonLink
          href="/admin/payments"
          variant="secondary"
          className="justify-start"
        >
          <BarChart3 className="mr-2 size-4" aria-hidden />
          Payments & orders
        </ButtonLink>
        <Link
          href="/admin/messages"
          className="inline-flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          <span className="flex items-center">
            <span className="mr-2 size-4">💬</span>
            Inbox
          </span>
        </Link>
      </div>
    </Card>
  );
}

