import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/security";
import { couponSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = couponSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid coupon", issues: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        ...parsed.data,
        code: parsed.data.code.toUpperCase(),
        description: parsed.data.description || null,
        startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
        expiresAt: parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : null,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to create coupon.",
      400,
    );
  }
}
