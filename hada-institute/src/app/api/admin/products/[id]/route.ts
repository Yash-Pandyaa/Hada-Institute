import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/security";
import { productSchema } from "@/lib/validation";

type ProductRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: ProductRouteContext) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const parsed = productSchema.partial().safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid product", issues: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        publishedAt:
          parsed.data.status === "PUBLISHED" ? new Date() : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "PRODUCT_UPDATE",
        entityType: "Product",
        entityId: product.id,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update product.",
      400,
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: ProductRouteContext,
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "PRODUCT_ARCHIVE",
        entityType: "Product",
        entityId: id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to archive product.",
      400,
    );
  }
}
