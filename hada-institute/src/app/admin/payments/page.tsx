import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { hasDatabaseUrl, prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Payments",
};

export default async function AdminPaymentsPage() {
  const [payments, webhooks] = hasDatabaseUrl
    ? await Promise.all([
        prisma.payment.findMany({
          include: { order: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.paymentWebhookLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ])
    : [[], []];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-normal">Payment logs</h1>
        <p className="mt-2 text-muted-foreground">
          Razorpay identifiers, verification status, webhook processing, and
          refund-ready tracking.
        </p>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Order</TH>
            <TH>Razorpay payment</TH>
            <TH>Status</TH>
            <TH>Date</TH>
            <TH className="text-right">Amount</TH>
          </TR>
        </THead>
        <TBody>
          {payments.map((payment) => (
            <TR key={payment.id}>
              <TD>{payment.order.orderNumber}</TD>
              <TD>{payment.razorpayPaymentId ?? payment.razorpayOrderId}</TD>
              <TD>
                <Badge
                  variant={
                    payment.status === "CAPTURED" ? "default" : "outline"
                  }
                >
                  {payment.status}
                </Badge>
              </TD>
              <TD>{formatDate(payment.createdAt)}</TD>
              <TD className="text-right font-semibold">
                {formatCurrency(payment.amount)}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Recent webhooks</h2>
        <div className="mt-4 grid gap-3">
          {webhooks.map((webhook) => (
            <div className="rounded-lg border p-3" key={webhook.id}>
              <div className="flex justify-between gap-3">
                <p className="font-semibold">{webhook.event}</p>
                <Badge variant={webhook.processed ? "default" : "destructive"}>
                  {webhook.processed ? "Processed" : "Pending"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(webhook.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
