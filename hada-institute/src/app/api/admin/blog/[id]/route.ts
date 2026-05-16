import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/security";

const updateSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(220),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  content: z.string().min(1),
  coverImageUrl: z.string().trim().url().nullable().optional(),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

type UpdatePayload = z.infer<typeof updateSchema>;

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    const { id } = params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return jsonError("Not found", 404);
    }

    return NextResponse.json({ post });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to fetch blog post.",
      400,
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    const parsed = updateSchema.parse(await request.json());
    const payload: UpdatePayload = parsed;

    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return jsonError("Not found", 404);
    }

    // slug uniqueness check if changed
    if (payload.slug && payload.slug !== post.slug) {
      const slugOwner = await prisma.blogPost.findUnique({
        where: { slug: payload.slug },
        select: { id: true },
      });
      if (slugOwner && slugOwner.id !== id) {
        return jsonError("Slug already exists", 409);
      }
    }

    const status = payload.status ?? post.status;
    const publishedAt =
      status === "PUBLISHED"
        ? payload.publishedAt
          ? new Date(payload.publishedAt)
          : new Date()
        : null;

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title: payload.title,
        slug: payload.slug,
        excerpt: payload.excerpt ? payload.excerpt : null,
        content: payload.content,
        coverImageUrl: payload.coverImageUrl ?? null,
        seoTitle: payload.seoTitle ? payload.seoTitle : null,
        seoDescription: payload.seoDescription ? payload.seoDescription : null,
        status,
        publishedAt,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "BLOG_UPDATE",
        entityType: "BlogPost",
        entityId: updated.id,
      },
    });

    return NextResponse.json({ post: updated });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update blog post.",
      400,
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return jsonError("Not found", 404);
    }

    await prisma.blogPost.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "BLOG_DELETE",
        entityType: "BlogPost",
        entityId: id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to delete blog post.",
      400,
    );
  }
}
