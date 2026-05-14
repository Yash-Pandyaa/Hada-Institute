import { getServerSession } from "next-auth";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { authOptions } from "@/lib/auth";
import { hasDatabaseUrl, prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Order History",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!hasDatabaseUrl || !session?.user.id) {
    return (
      <EmptyState
        description="Orders will be available after database setup and successful checkout."
        title="No orders yet"
      />
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold tracking-normal">Order history</h1>
      {orders.length > 0 ? (
        <div className="mt-5">
          <Table>
            <THead>
              <TR>
                <TH>Order</TH>
                <TH>Date</TH>
                <TH>Status</TH>
                <TH>Items</TH>
                <TH className="text-right">Total</TH>
              </TR>
            </THead>
            <TBody>
              {orders.map((order) => (
                <TR key={order.id}>
                  <TD className="font-semibold">{order.orderNumber}</TD>
                  <TD>{formatDate(order.createdAt)}</TD>
                  <TD>
                    <Badge
                      variant={order.status === "PAID" ? "default" : "outline"}
                    >
                      {order.status}
                    </Badge>
                  </TD>
                  <TD>{order.items.length}</TD>
                  <TD className="text-right font-semibold">
                    {formatCurrency(order.total, order.currency)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="Your paid and pending orders will be listed here."
            title="No orders yet"
          />
        </div>
      )}
    </div>
  );
}
