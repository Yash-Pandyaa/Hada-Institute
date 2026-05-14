import { Download } from "lucide-react";
import { getServerSession } from "next-auth";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { authOptions } from "@/lib/auth";
import { hasDatabaseUrl, prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "My Library",
};

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);

  if (!hasDatabaseUrl || !session?.user.id) {
    return (
      <EmptyState
        description="Purchased notes will appear here after database setup and successful payment."
        title="No downloads yet"
      />
    );
  }

  const downloads = await prisma.downloadAccess.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold tracking-normal">Purchased notes</h1>
      {downloads.length > 0 ? (
        <div className="mt-5 grid gap-4">
          {downloads.map((download) => (
            <div
              className="flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
              key={download.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{download.product.title}</h2>
                  <Badge
                    variant={
                      download.status === "ACTIVE" ? "default" : "destructive"
                    }
                  >
                    {download.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {download.downloadCount}/{download.downloadLimit} downloads ·
                  Expires {formatDate(download.expiresAt)}
                </p>
              </div>
              <ButtonLink href={`/api/downloads/${download.token}`}>
                <Download className="size-4" aria-hidden />
                Download
              </ButtonLink>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="After Razorpay payment verification, secure PDF access is issued here."
            title="No purchased notes"
          />
        </div>
      )}
    </div>
  );
}
