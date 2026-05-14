import { NextResponse } from "next/server";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay";
import { jsonError, requireUser } from "@/lib/security";
import { razorpayVerifySchema } from "@/lib/validation";
import { markOrderPaid } from "@/services/orders";

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const parsed = razorpayVerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment verification payload" },
        { status: 422 },
      );
    }

    const verified = verifyRazorpayPaymentSignature({
      razorpayOrderId: parsed.data.razorpayOrderId,
      razorpayPaymentId: parsed.data.razorpayPaymentId,
      razorpaySignature: parsed.data.razorpaySignature,
    });

    if (!verified) {
      return jsonError("Invalid payment signature.", 400);
    }

    const order = await markOrderPaid({
      orderId: parsed.data.orderId,
      userId: session.user.id,
      razorpayOrderId: parsed.data.razorpayOrderId,
      razorpayPaymentId: parsed.data.razorpayPaymentId,
      razorpaySignature: parsed.data.razorpaySignature,
      rawResponse: body,
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return jsonError("Please sign in before verifying payment.", 401);
    }

    return jsonError(
      error instanceof Error ? error.message : "Payment verification failed.",
      400,
    );
  }
}
