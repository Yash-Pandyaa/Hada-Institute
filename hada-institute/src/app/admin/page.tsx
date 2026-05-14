import { BarChart3, IndianRupee, ShoppingBag, UsersRound } from "lucide-react";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getDashboardStats } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-normal">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Sales, revenue, products, users, and recent order activity.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          currency
          icon={IndianRupee}
          label="Total sales"
          value={stats.totalSales}
        />
        <StatCard
          currency
          icon={BarChart3}
          label="Monthly revenue"
          value={stats.monthlyRevenue}
        />
        <StatCard icon={ShoppingBag} label="Products" value={stats.products} />
        <StatCard
          icon={UsersRound}
          label="Active users"
          value={stats.activeUsers}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Revenue trend</h2>
          <RevenueChart data={stats.revenueSeries} />
        </section>
        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Top products</h2>
          <div className="mt-4 grid gap-3">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product) => (
                <div className="rounded-lg border p-3" key={product.productId}>
                  <p className="font-semibold">{product.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {product._sum.quantity ?? 0} sold ·{" "}
                    {formatCurrency(product._sum.lineTotal ?? 0)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No paid product data yet.
              </p>
            )}
          </div>
        </section>
      </div>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
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
              <TH>Status</TH>
              <TH>Date</TH>
              <TH className="text-right">Total</TH>
            </TR>
          </THead>
          <TBody>
            {stats.recentOrders.map((order) => (
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
                <TD>{formatDate(order.createdAt)}</TD>
                <TD className="text-right font-semibold">
                  {formatCurrency(order.total)}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
