import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import type { AdminCmsDashboardOverview } from "@/lib/data";

export function DraftsOverview({
  overview,
}: {
  overview: AdminCmsDashboardOverview;
}) {
  const { counts } = overview;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Drafts & publishing</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Where your content needs attention.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Blogs</span>
            <Badge variant="outline">Drafts</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold">{counts.blogs.draft}</div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="default">{counts.blogs.published} published</Badge>
          </div>
          <div className="mt-3">
            <ButtonLink href="/admin/blog" size="sm" className="w-full">
              Open blog admin
            </ButtonLink>
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Products</span>
            <Badge variant="outline">Drafts</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold">{counts.products.draft}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="default">{counts.products.published} published</Badge>
            {counts.products.archived > 0 ? (
              <Badge variant="secondary">{counts.products.archived} archived</Badge>
            ) : null}
          </div>
          <div className="mt-3">
            <ButtonLink
              href="/admin/products"
              size="sm"
              className="w-full"
            >
              Open product admin
            </ButtonLink>
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subject notes</span>
            <Badge variant="outline">Drafts</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold">{counts.subjectNotes.draft}</div>
          <div className="mt-2">
            <Badge variant="default">{counts.subjectNotes.published} published</Badge>
          </div>
          <div className="mt-3">
            <ButtonLink href="/admin/subjects" size="sm" className="w-full">
              Open subject notes
            </ButtonLink>
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Banners</span>
            <Badge variant="outline">Active</Badge>
          </div>
          <div className="mt-2 text-2xl font-bold">{counts.banners.active}</div>
          <div className="mt-2">
            {counts.banners.inactive > 0 ? (
              <Badge variant="secondary">{counts.banners.inactive} inactive</Badge>
            ) : (
              <Badge variant="default">0 inactive</Badge>
            )}
          </div>
          <div className="mt-3">
            <ButtonLink
              href="/admin/banners"
              size="sm"
              className="w-full"
            >
              Open banner admin
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Tip: Use publish/unpublish from each entity’s detail page to keep storefront
        in sync.
      </div>
    </Card>
  );
}

