import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

type AdminRecentUploadItem = {
  id: string;
  type: "Product" | "SubjectNote";
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: Date;
  thumbnailUrl?: string | null;
};

export function RecentUploads({
  items,
}: {
  items: AdminRecentUploadItem[];
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Recent uploads</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The latest content files & previews.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 text-sm text-muted-foreground">No uploads yet.</div>
      ) : (
        <div className="mt-4">
          <Table>
            <THead>
              <TR>
                <TH>Content</TH>
                <TH>Status</TH>
                <TH>Updated</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((item) => (
                <TR key={`${item.type}:${item.id}`}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center overflow-hidden rounded-md bg-slate-50 ring-1 ring-slate-200">
                        {item.thumbnailUrl ? (
                          <div
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${item.thumbnailUrl})` }}
                            aria-label="thumbnail"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">{item.type === "Product" ? "PDF" : "Note"}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.type}</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Link
                        href={
                          item.type === "Product"
                            ? `/admin/products/${item.id}`
                            : `/admin/subject-notes/${item.id}`
                        }
                        className="text-xs font-medium text-primary"
                      >
                        Open editor
                      </Link>
                    </div>
                  </TD>
                  <TD>
                    <Badge
                      variant={item.status === "PUBLISHED" ? "default" : "outline"}
                    >
                      {item.status}
                    </Badge>
                  </TD>
                  <TD>{formatDate(item.updatedAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </Card>
  );
}

