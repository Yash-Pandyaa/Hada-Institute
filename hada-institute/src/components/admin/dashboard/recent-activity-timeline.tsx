"use client";

import { formatDate } from "@/lib/utils";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AdminRecentActivityItem = {
  id: string;
  createdAt: Date;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: unknown;
};

function formatActionLabel(action: string) {
  // keep it simple and readable for audit feed
  return action
    .replaceAll("_", " ")
    .replaceAll(/([A-Z])/g, " $1")
    .trim();
}

export function RecentActivityTimeline({
  items,
}: {
  items: AdminRecentActivityItem[];
}) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold">Recent activity</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Audit timeline across publishing operations.
      </p>

      {items.length === 0 ? (
        <div className="mt-4 text-sm text-muted-foreground">
          No audit activity yet.
        </div>
      ) : (
        <div className="mt-4">
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="mt-1 size-2 shrink-0 rounded-full bg-teal-500" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{item.entityType}</Badge>
                    <span className="text-sm font-medium">
                      {formatActionLabel(item.action)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {item.actorEmail ? `By ${item.actorEmail} · ` : ""}
                    {formatDate(item.createdAt)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}


