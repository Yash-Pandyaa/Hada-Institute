import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { hasDatabaseUrl, prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Products",
};

export default async function AdminProductsPage() {
  const products = hasDatabaseUrl
    ? await prisma.product.findMany({
        include: { category: true, subject: true },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Products</h1>
          <p className="mt-2 text-muted-foreground">
            Upload PDFs, manage pricing, publishing, discounts, and metadata.
          </p>
        </div>
        <ButtonLink href="/admin/products/new">New product</ButtonLink>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Product</TH>
            <TH>Subject</TH>
            <TH>Status</TH>
            <TH>Featured</TH>
            <TH>Updated</TH>
            <TH className="text-right">Price</TH>
          </TR>
        </THead>
        <TBody>
          {products.map((product) => (
            <TR key={product.id}>
              <TD>
                <Link
                  className="font-semibold text-primary"
                  href={`/admin/products/${product.id}`}
                >
                  {product.title}
                </Link>
                <p className="text-xs text-muted-foreground">{product.slug}</p>
              </TD>
              <TD>{product.subject?.name ?? "Unassigned"}</TD>
              <TD>
                <Badge
                  variant={
                    product.status === "PUBLISHED" ? "default" : "outline"
                  }
                >
                  {product.status}
                </Badge>
              </TD>
              <TD>{product.featured ? "Yes" : "No"}</TD>
              <TD>{formatDate(product.updatedAt)}</TD>
              <TD className="text-right font-semibold">
                {formatCurrency(product.price)}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
