import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/security";

const schema = z.object({
  status: z.enum([
    "PENDING",
    "PAID",
    "FAILED",
    "CANCELLED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ]),
});

type OrderRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: OrderRouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const parsed = schema.parse(await request.json());
    const order = await prisma.order.update({
      where: { id },
      data: { status: parsed.status },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "ORDER_STATUS_UPDATE",
        entityType: "Order",
        entityId: order.id,
        metadata: { status: parsed.status },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update order.",
      400,
    );
  }
}
