import { QuickCreateForm } from "@/components/admin/quick-create-form";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { hasDatabaseUrl, prisma } from "@/lib/db";

export const metadata = {
  title: "Categories",
};

export default async function AdminCategoriesPage() {
  const categories = hasDatabaseUrl
    ? await prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <QuickCreateForm endpoint="/api/admin/categories" label="Category" />
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Slug</TH>
            <TH>Products</TH>
          </TR>
        </THead>
        <TBody>
          {categories.map((category) => (
            <TR key={category.id}>
              <TD className="font-semibold">{category.name}</TD>
              <TD>{category.slug}</TD>
              <TD>{category._count.products}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
