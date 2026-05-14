import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db";
import { jsonError, requireUser } from "@/lib/security";
import { checkoutSchema } from "@/lib/validation";
import { createCheckoutOrder } from "@/services/orders";

export async function POST(request: Request) {
  if (!hasDatabaseUrl) {
    return jsonError("Database is not configured for checkout.", 503);
  }

  try {
    const session = await requireUser();
    const parsed = checkoutSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout payload", issues: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const order = await createCheckoutOrder(parsed.data, session.user.id);

    return NextResponse.json({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return jsonError("Please sign in before checkout.", 401);
    }

    return jsonError(
      error instanceof Error ? error.message : "Unable to create order.",
      400,
    );
  }
}
