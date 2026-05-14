import { ProductForm } from "@/components/admin/product-form";
import { hasDatabaseUrl, prisma } from "@/lib/db";

export const metadata = {
  title: "New Product",
};

export default async function NewProductPage() {
  const [categories, subjects] = hasDatabaseUrl
    ? await Promise.all([
        prisma.category.findMany({ orderBy: { name: "asc" } }),
        prisma.subject.findMany({ orderBy: { name: "asc" } }),
      ])
    : [[], []];

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h1 className="text-3xl font-bold tracking-normal">New product</h1>
      <p className="mt-2 text-muted-foreground">
        Attach Cloudinary PDF keys/URLs and publish only after official catalog
        details are verified.
      </p>
      <div className="mt-6">
        <ProductForm categories={categories} subjects={subjects} />
      </div>
    </div>
  );
}
