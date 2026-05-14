import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { hasDatabaseUrl, prisma } from "@/lib/db";

export const metadata = {
  title: "Banner Management",
};

export default async function AdminBannersPage() {
  const banners = hasDatabaseUrl
    ? await prisma.banner.findMany({
        orderBy: [{ placement: "asc" }, { sortOrder: "asc" }],
      })
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-normal">Homepage banners</h1>
      <p className="mt-2 text-muted-foreground">
        Manage promotional homepage and marketplace banners.
      </p>
      <div className="mt-5">
        <Table>
          <THead>
            <TR>
              <TH>Title</TH>
              <TH>Placement</TH>
              <TH>CTA</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {banners.map((banner) => (
              <TR key={banner.id}>
                <TD className="font-semibold">{banner.title}</TD>
                <TD>{banner.placement}</TD>
                <TD>{banner.ctaLabel ?? "None"}</TD>
                <TD>
                  <Badge variant={banner.isActive ? "default" : "outline"}>
                    {banner.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
