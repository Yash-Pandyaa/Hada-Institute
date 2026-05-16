import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import type { AdminContentStatistics } from "@/lib/data";

export function ContentStatistics({
  stats,
}: {
  stats: AdminContentStatistics;
}) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold">Content statistics</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Operational overview across your CMS.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">Drafts total</div>
          <div className="mt-1 text-2xl font-bold">{stats.draftsTotal}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">Published total</div>
          <div className="mt-1 text-2xl font-bold">{stats.publishedTotal}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">Active banners</div>
          <div className="mt-1 text-2xl font-bold">{stats.activeBanners}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="default">{stats.featuredProducts} featured products</Badge>
        <Badge variant="secondary">
          {stats.featuredSubjectNotes} featured subject notes
        </Badge>
      </div>
    </Card>
  );
}

