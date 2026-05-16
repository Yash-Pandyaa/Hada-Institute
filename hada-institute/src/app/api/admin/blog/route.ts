import type { BlogStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/security";
import { slugify } from "@/lib/utils";

const createSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(220),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  content: z.string().min(1),
  coverImageUrl: z.string().trim().url().nullable().optional(),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

type CreatePayload = z.infer<typeof createSchema>;

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status")?.trim();
    const take = Math.min(Number(url.searchParams.get("take") || "20"), 50);

    // Use Prisma's generated type for type safety
    const where: Prisma.BlogPostWhereInput = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ];
    }

    if (status === "DRAFT" || status === "PUBLISHED") {
      where.status = status as BlogStatus;
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to fetch blog posts.",
      400,
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const parsed = createSchema.parse(await request.json());
    const payload: CreatePayload = parsed;

    const existing = await prisma.blogPost.findUnique({
      where: { slug: payload.slug },
      select: { id: true },
    });
    if (existing) {
      return jsonError("Slug already exists.", 409);
    }

    const post = await prisma.blogPost.create({
      data: {
        title: payload.title,
        slug: slugify(payload.slug),
        excerpt: payload.excerpt ? payload.excerpt : null,
        content: payload.content,
        coverImageUrl: payload.coverImageUrl || null,
        status: payload.status as BlogStatus,
        publishedAt: payload.status === "PUBLISHED" ? new Date() : null,
        seoTitle: payload.seoTitle ? payload.seoTitle : null,
        seoDescription: payload.seoDescription ? payload.seoDescription : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "BLOG_CREATE",
        entityType: "BlogPost",
        entityId: post.id,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to create blog post.",
      400,
    );
  }
}
