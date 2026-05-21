import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/security";
import { slugify } from "@/lib/utils";

const updateSchema = z.object({
  subjectId: z.string().min(1).optional(),
  title: z.string().trim().min(3).max(200).optional(),
  slug: z.string().trim().min(3).max(220).optional(),
  description: z.string().trim().max(3000).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).optional(),
  excerpt: z.string().trim().max(500).optional().nullable(),

  price: z.number().int().min(0).optional(),
  isFeatured: z.boolean().optional(),

  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  publishedAt: z.string().datetime().optional().nullable(),

  pdfUrl: z.string().trim().url().nullable().optional(),
  pdfKey: z.string().trim().optional().nullable(),

  thumbnailUrl: z.string().trim().url().nullable().optional(),
  thumbnailKey: z.string().trim().optional().nullable(),

  previewImages: z.array(z.string().trim().url()).optional(),
});

type UpdatePayload = z.infer<typeof updateSchema>;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const resolvedParams = await params;

    const note = await prisma.subjectNote.findUnique({
      where: { id: resolvedParams.id },
      include: { subject: true },
    });

    if (!note) {
      return jsonError("Not found", 404);
    }

    return NextResponse.json({ note });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to fetch subject note.",
      400,
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    const resolvedParams = await params;

    const parsed = updateSchema.parse(await request.json());
    const payload: UpdatePayload = parsed;

    const current = await prisma.subjectNote.findUnique({
      where: { id: resolvedParams.id },
    });
    if (!current) {
      return jsonError("Not found", 404);
    }

    if (payload.slug && payload.slug !== current.slug) {
      const slugOwner = await prisma.subjectNote.findUnique({
        where: { slug: payload.slug },
        select: { id: true },
      });
      if (slugOwner && slugOwner.id !== resolvedParams.id) {
        return jsonError("Slug already exists", 409);
      }
    }

    const status = payload.status ?? current.status;
    const publishedAt =
      status === "PUBLISHED"
        ? payload.publishedAt
          ? new Date(payload.publishedAt)
          : (current.publishedAt ?? new Date())
        : null;

    const updated = await prisma.subjectNote.update({
      where: { id: resolvedParams.id },
      data: {
        subjectId: payload.subjectId ?? current.subjectId,
        title: payload.title ?? current.title,
        slug: payload.slug ? slugify(payload.slug) : current.slug,
        description:
          payload.description === undefined
            ? current.description
            : payload.description,
        tags: payload.tags ?? current.tags,
        excerpt:
          payload.excerpt === undefined ? current.excerpt : payload.excerpt,

        price: payload.price ?? current.price,
        isFeatured: payload.isFeatured ?? current.isFeatured,

        status,
        publishedAt,

        pdfUrl: payload.pdfUrl === undefined ? current.pdfUrl : payload.pdfUrl,
        pdfKey: payload.pdfKey === undefined ? current.pdfKey : payload.pdfKey,

        thumbnailUrl:
          payload.thumbnailUrl === undefined
            ? current.thumbnailUrl
            : payload.thumbnailUrl,
        thumbnailKey:
          payload.thumbnailKey === undefined
            ? current.thumbnailKey
            : payload.thumbnailKey,

        previewImages:
          payload.previewImages === undefined
            ? current.previewImages
            : payload.previewImages,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "SUBJECT_NOTE_UPDATE",
        entityType: "SubjectNote",
        entityId: updated.id,
      },
    });

    return NextResponse.json({ note: updated });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update subject note.",
      400,
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    const resolvedParams = await params;

    const current = await prisma.subjectNote.findUnique({
      where: { id: resolvedParams.id },
    });
    if (!current) {
      return jsonError("Not found", 404);
    }

    await prisma.subjectNote.delete({ where: { id: resolvedParams.id } });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "SUBJECT_NOTE_DELETE",
        entityType: "SubjectNote",
        entityId: resolvedParams.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to delete subject note.",
      400,
    );
  }
}
