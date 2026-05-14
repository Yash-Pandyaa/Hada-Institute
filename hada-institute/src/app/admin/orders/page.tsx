import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { hasDatabaseUrl, prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Orders",
};

export default async function AdminOrdersPage() {
  const orders = hasDatabaseUrl
    ? await prisma.order.findMany({
        include: { user: true, items: true, payments: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <div className="mb-5 flex justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Orders</h1>
          <p className="mt-2 text-muted-foreground">
            Manage payment status, fulfillment, refunds, and reconciliation.
          </p>
        </div>
        <a
          className="text-sm font-semibold text-primary"
          href="/api/admin/export/orders"
        >
          Export CSV
        </a>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Order</TH>
            <TH>Customer</TH>
            <TH>Payment</TH>
            <TH>Items</TH>
            <TH>Date</TH>
            <TH className="text-right">Total</TH>
          </TR>
        </THead>
        <TBody>
          {orders.map((order) => (
            <TR key={order.id}>
              <TD className="font-semibold">{order.orderNumber}</TD>
              <TD>{order.user.email}</TD>
              <TD>
                <Badge
                  variant={order.status === "PAID" ? "default" : "outline"}
                >
                  {order.status}
                </Badge>
              </TD>
              <TD>{order.items.length}</TD>
              <TD>{formatDate(order.createdAt)}</TD>
              <TD className="text-right font-semibold">
                {formatCurrency(order.total)}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
