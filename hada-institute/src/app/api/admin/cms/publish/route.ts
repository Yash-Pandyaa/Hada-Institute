import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/security";


const publishSchema = z.object({
  entityType: z.enum(["BlogPost", "Product", "SubjectNote"]),
  entityId: z.string().min(1),
  nextStatus: z.enum(["DRAFT", "PUBLISHED"]),
});

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const payload = publishSchema.parse(await request.json());

    const now = new Date();

    if (payload.entityType === "BlogPost") {
      const updated = await prisma.blogPost.update({
        where: { id: payload.entityId },
        data: {
          status: payload.nextStatus,
          publishedAt: payload.nextStatus === "PUBLISHED" ? now : null,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: payload.nextStatus === "PUBLISHED" ? "BLOG_PUBLISH" : "BLOG_UNPUBLISH",
          entityType: "BlogPost",
          entityId: updated.id,
        },
      });

      return NextResponse.json({ ok: true, blogPost: updated });
    }

    if (payload.entityType === "Product") {
      const updated = await prisma.product.update({
        where: { id: payload.entityId },
        data: {
          status: payload.nextStatus === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
          publishedAt: payload.nextStatus === "PUBLISHED" ? now : null,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: payload.nextStatus === "PUBLISHED" ? "PRODUCT_PUBLISH" : "PRODUCT_UNPUBLISH",
          entityType: "Product",
          entityId: updated.id,
        },
      });

      return NextResponse.json({ ok: true, product: updated });
    }

    // SubjectNote
    const updated = await prisma.subjectNote.update({
      where: { id: payload.entityId },
      data: {
        status: payload.nextStatus,
        publishedAt: payload.nextStatus === "PUBLISHED" ? now : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action:
          payload.nextStatus === "PUBLISHED"
            ? "SUBJECT_NOTE_PUBLISH"
            : "SUBJECT_NOTE_UNPUBLISH",
        entityType: "SubjectNote",
        entityId: updated.id,
      },
    });

    return NextResponse.json({ ok: true, subjectNote: updated });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update publish state.",
      400,
    );
  }
}

