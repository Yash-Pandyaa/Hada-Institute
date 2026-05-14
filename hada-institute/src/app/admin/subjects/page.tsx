import { QuickCreateForm } from "@/components/admin/quick-create-form";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { hasDatabaseUrl, prisma } from "@/lib/db";

export const metadata = {
  title: "Subjects",
};

export default async function AdminSubjectsPage() {
  const subjects = hasDatabaseUrl
    ? await prisma.subject.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <QuickCreateForm endpoint="/api/admin/subjects" label="Subject" />
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Slug</TH>
            <TH>Products</TH>
          </TR>
        </THead>
        <TBody>
          {subjects.map((subject) => (
            <TR key={subject.id}>
              <TD className="font-semibold">{subject.name}</TD>
              <TD>{subject.slug}</TD>
              <TD>{subject._count.products}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
