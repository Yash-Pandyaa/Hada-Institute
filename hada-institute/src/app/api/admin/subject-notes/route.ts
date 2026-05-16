import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/security";
import { slugify } from "@/lib/utils";
import type { Prisma, NoteStatus } from "@prisma/client";


const createSchema = z.object({
  subjectId: z.string().min(1),
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(220),
  description: z.string().trim().max(3000).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).default([]),
  excerpt: z.string().trim().max(500).optional().nullable(),

  price: z.number().int().min(0),
  isFeatured: z.boolean().default(false),

  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  publishedAt: z.string().datetime().optional().nullable(),

  pdfUrl: z.string().trim().url().nullable().optional(),
  pdfKey: z.string().trim().optional().nullable(),

  thumbnailUrl: z.string().trim().url().nullable().optional(),
  thumbnailKey: z.string().trim().optional().nullable(),

  previewImages: z.array(z.string().trim().url()).default([]),
});

type CreatePayload = z.infer<typeof createSchema>;

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status")?.trim();
    const subjectId = url.searchParams.get("subjectId")?.trim();
    const take = Math.min(Number(url.searchParams.get("take") || "20"), 50);

    // Use Prisma's native type instead of Record<string, unknown>
    const where: Prisma.SubjectNoteWhereInput = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
      ];
    }

    if (status === "DRAFT" || status === "PUBLISHED") {
      // Cast validated string to the native Prisma enum type
      where.status = status as NoteStatus;
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    const notes = await prisma.subjectNote.findMany({
      where,
      include: { subject: true },
      orderBy: { updatedAt: "desc" },
      take,
    });

    return NextResponse.json({ notes });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to fetch notes.",
      400,
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();

    const parsed = createSchema.parse(await request.json());
    const payload: CreatePayload = parsed;

    const existing = await prisma.subjectNote.findUnique({
      where: { slug: payload.slug },
      select: { id: true },
    });
    if (existing) {
      return jsonError("Slug already exists.", 409);
    }

    const status = payload.status;
    const publishedAt =
      status === "PUBLISHED"
        ? payload.publishedAt
          ? new Date(payload.publishedAt)
          : new Date()
        : null;

    const note = await prisma.subjectNote.create({
      data: {
        subjectId: payload.subjectId,
        title: payload.title,
        slug: slugify(payload.slug),
        description: payload.description ?? null,
        tags: payload.tags,
        excerpt: payload.excerpt ?? null,

        price: payload.price,
        isFeatured: payload.isFeatured,

        status: status as NoteStatus,
        publishedAt,

        pdfUrl: payload.pdfUrl ?? null,
        pdfKey: payload.pdfKey ?? null,

        thumbnailUrl: payload.thumbnailUrl ?? null,
        thumbnailKey: payload.thumbnailKey ?? null,

        previewImages: payload.previewImages,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "SUBJECT_NOTE_CREATE",
        entityType: "SubjectNote",
        entityId: note.id,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to create subject note.",
      400,
    );
  }
}
