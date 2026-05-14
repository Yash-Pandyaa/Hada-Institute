import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, sanitizeCsvCell } from "@/lib/security";

export async function GET() {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    include: { user: true, items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "order_number",
    "customer_email",
    "status",
    "subtotal",
    "discount",
    "total",
    "razorpay_order_id",
    "created_at",
  ];
  const rows = orders.map((order) =>
    [
      order.orderNumber,
      order.user.email,
      order.status,
      order.subtotal,
      order.discountTotal,
      order.total,
      order.razorpayOrderId,
      order.createdAt.toISOString(),
    ]
      .map((cell) => `"${sanitizeCsvCell(cell)}"`)
      .join(","),
  );

  return new NextResponse([header.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=orders.csv",
    },
  });
}
