import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { hasDatabaseUrl, prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";

type ProductParams = Promise<{ id: string }>;

export default async function AdminProductDetailPage({
  params,
}: {
  params: ProductParams;
}) {
  if (!hasDatabaseUrl) {
    notFound();
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, subject: true },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">
            {product.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{product.slug}</p>
        </div>
        <Badge variant={product.status === "PUBLISHED" ? "default" : "outline"}>
          {product.status}
        </Badge>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Price</p>
          <p className="mt-1 text-xl font-bold">
            {formatCurrency(product.price)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Subject</p>
          <p className="mt-1 font-semibold">
            {product.subject?.name ?? "Unassigned"}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Updated</p>
          <p className="mt-1 font-semibold">{formatDate(product.updatedAt)}</p>
        </div>
      </div>
      <p className="mt-6 leading-7 text-muted-foreground">
        {product.description}
      </p>
    </div>
  );
}
