import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/security";

const updateSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  subtitle: z.string().trim().max(250).optional().nullable(),
  placement: z.string().trim().min(2).max(80).optional(),
  imageUrl: z.string().trim().url().nullable().optional(),
  isActive: z.boolean().optional(),
  ctaLabel: z.string().trim().max(80).optional().nullable(),
  ctaHref: z.string().trim().max(2048).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});

type UpdatePayload = z.infer<typeof updateSchema>;

type ParamsContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: ParamsContext,
) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return jsonError("Not found", 404);
    }

    return NextResponse.json({ banner });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to fetch banner.",
      400,
    );
  }
}

export async function PATCH(
  request: Request,
  context: ParamsContext,
) {
  try {
    const session = await requireAdmin();
    const parsed = updateSchema.parse(await request.json());
    const payload: UpdatePayload = parsed;

    const { id } = await context.params;

    const current = await prisma.banner.findUnique({
      where: { id },
    });
    if (!current) {
      return jsonError("Not found", 404);
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: {
        title: payload.title ?? current.title,
        subtitle:
          payload.subtitle === undefined ? current.subtitle : payload.subtitle,
        placement: payload.placement ?? current.placement,
        imageUrl:
          payload.imageUrl === undefined ? current.imageUrl : payload.imageUrl,
        isActive: payload.isActive ?? current.isActive,
        ctaLabel:
          payload.ctaLabel === undefined ? current.ctaLabel : payload.ctaLabel,
        ctaHref:
          payload.ctaHref === undefined ? current.ctaHref : payload.ctaHref,
        sortOrder: payload.sortOrder ?? current.sortOrder,
        startsAt:
          payload.startsAt === undefined
            ? current.startsAt
            : payload.startsAt
              ? new Date(payload.startsAt)
              : null,
        endsAt:
          payload.endsAt === undefined
            ? current.endsAt
            : payload.endsAt
              ? new Date(payload.endsAt)
              : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "BANNER_UPDATE",
        entityType: "Banner",
        entityId: updated.id,
        metadata: { placement: updated.placement, title: updated.title },
      },
    });

    return NextResponse.json({ banner: updated });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update banner.",
      400,
    );
  }
}

export async function DELETE(
  _request: Request,
  context: ParamsContext,
) {
  try {
    const session = await requireAdmin();

    const { id } = await context.params;

    const current = await prisma.banner.findUnique({
      where: { id },
    });
    if (!current) {
      return jsonError("Not found", 404);
    }

    await prisma.banner.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "BANNER_DELETE",
        entityType: "Banner",
        entityId: id,
        metadata: { placement: current.placement, title: current.title },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to delete banner.",
      400,
    );
  }
}

