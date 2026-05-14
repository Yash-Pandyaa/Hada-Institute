import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { hasDatabaseUrl, prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Users",
};

export default async function AdminUsersPage() {
  const users = hasDatabaseUrl
    ? await prisma.user.findMany({
        include: { _count: { select: { orders: true, downloadAccess: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-normal">Users</h1>
      <p className="mt-2 text-muted-foreground">
        Student accounts, order counts, and download access overview.
      </p>
      <div className="mt-5">
        <Table>
          <THead>
            <TR>
              <TH>User</TH>
              <TH>Role</TH>
              <TH>Orders</TH>
              <TH>Downloads</TH>
              <TH>Joined</TH>
            </TR>
          </THead>
          <TBody>
            {users.map((user) => (
              <TR key={user.id}>
                <TD>
                  <p className="font-semibold">{user.name ?? "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </TD>
                <TD>
                  <Badge
                    variant={user.role === "ADMIN" ? "secondary" : "outline"}
                  >
                    {user.role}
                  </Badge>
                </TD>
                <TD>{user._count.orders}</TD>
                <TD>{user._count.downloadAccess}</TD>
                <TD>{formatDate(user.createdAt)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
