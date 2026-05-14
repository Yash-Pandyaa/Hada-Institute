import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { jsonError } from "@/lib/security";
import { markOrderPaid, markPaymentFailed } from "@/services/orders";

type RazorpayWebhookPayload = {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id: string;
        order_id: string;
        status?: string;
        error_description?: string;
      };
    };
    refund?: {
      entity?: {
        id: string;
        payment_id: string;
        amount: number;
      };
    };
  };
};

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return jsonError("Missing Razorpay signature.", 400);
  }

  const rawBody = await request.text();
  const payload = JSON.parse(rawBody) as RazorpayWebhookPayload;

  const log = await prisma.paymentWebhookLog.create({
    data: {
      event: payload.event,
      signature,
      payload: payload as unknown as Prisma.InputJsonValue,
    },
  });

  try {
    const verified = verifyRazorpayWebhookSignature(rawBody, signature);

    if (!verified) {
      throw new Error("Invalid webhook signature.");
    }

    const payment = payload.payload?.payment?.entity;

    if (payload.event === "payment.captured" && payment?.order_id) {
      const order = await prisma.order.findUnique({
        where: { razorpayOrderId: payment.order_id },
        select: { id: true },
      });

      if (order) {
        await markOrderPaid({
          orderId: order.id,
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          rawResponse: payload as unknown as Prisma.InputJsonValue,
        });
      }
    }

    if (payload.event === "payment.failed" && payment?.order_id) {
      await markPaymentFailed({
        razorpayOrderId: payment.order_id,
        reason: payment.error_description,
        rawResponse: payload as unknown as Prisma.InputJsonValue,
      });
    }

    if (payload.event === "refund.processed") {
      const refund = payload.payload?.refund?.entity;
      if (refund) {
        await prisma.payment.updateMany({
          where: { razorpayPaymentId: refund.payment_id },
          data: {
            status: "REFUNDED",
            refundedAmount: { increment: refund.amount },
          },
        });
      }
    }

    await prisma.paymentWebhookLog.update({
      where: { id: log.id },
      data: { processed: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    await prisma.paymentWebhookLog.update({
      where: { id: log.id },
      data: {
        error: error instanceof Error ? error.message : "Webhook failed",
      },
    });

    return jsonError("Webhook rejected.", 400);
  }
}
