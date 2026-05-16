import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/security";

const bannerSchema = z.object({
  title: z.string().trim().min(2).max(200),
  subtitle: z.string().trim().max(250).optional().nullable(),
  placement: z.string().trim().min(2).max(80),
  imageUrl: z.string().trim().url().nullable().optional(),
  isActive: z.boolean().default(true),
  ctaLabel: z.string().trim().max(80).optional().nullable(),
  ctaHref: z.string().trim().max(2048).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});

type CreateBannerPayload = z.infer<typeof bannerSchema>;

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const placement = url.searchParams.get("placement")?.trim();
    const q = url.searchParams.get("q")?.trim();
    const take = Math.min(Number(url.searchParams.get("take") || "50"), 100);

    const where: Record<string, unknown> = {};

    if (placement) {
      where.placement = placement;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { subtitle: { contains: q, mode: "insensitive" } },
        { ctaLabel: { contains: q, mode: "insensitive" } },
        { placement: { contains: q, mode: "insensitive" } },
      ];
    }

    const banners = await prisma.banner.findMany({
      // biome-ignore lint/suspicious/noExplicitAny: Prisma types vary by generated client; keep runtime behavior.
      where: where as any,
      orderBy: [
        { placement: "asc" },
        { sortOrder: "asc" },
        { updatedAt: "desc" },
      ],
      take,
    });

    return NextResponse.json({ banners });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to fetch banners.",
      400,
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const parsed = bannerSchema.parse(await request.json());
    const payload: CreateBannerPayload = parsed;

    const nextSortOrder =
      payload.sortOrder ??
      (await prisma.banner.count({ where: { placement: payload.placement } }));

    const banner = await prisma.banner.create({
      data: {
        title: payload.title,
        subtitle: payload.subtitle ?? null,
        placement: payload.placement,
        imageUrl: payload.imageUrl ?? null,
        isActive: payload.isActive,
        ctaLabel: payload.ctaLabel ?? null,
        ctaHref: payload.ctaHref ?? null,
        sortOrder: nextSortOrder,
        startsAt: payload.startsAt ? new Date(payload.startsAt) : null,
        endsAt: payload.endsAt ? new Date(payload.endsAt) : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "BANNER_CREATE",
        entityType: "Banner",
        entityId: banner.id,
        metadata: {
          placement: banner.placement,
          title: banner.title,
        },
      },
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to create banner.",
      400,
    );
  }
}
