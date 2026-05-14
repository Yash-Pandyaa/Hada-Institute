import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/security";
import { productSchema } from "@/lib/validation";

export async function GET() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    include: { category: true, subject: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const parsed = productSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid product", issues: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        thumbnailUrl: parsed.data.thumbnailUrl || null,
        samplePdfUrl: parsed.data.samplePdfUrl || null,
        fullPdfKey: parsed.data.fullPdfKey || null,
        fullPdfUrl: parsed.data.fullPdfUrl || null,
        classLevel: parsed.data.classLevel || null,
        examType: parsed.data.examType || null,
        publishedAt:
          parsed.data.status === "PUBLISHED" ? new Date() : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "PRODUCT_CREATE",
        entityType: "Product",
        entityId: product.id,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to create product.",
      400,
    );
  }
}
