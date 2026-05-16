import type { BlogStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, slugify } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const submitSchema = z.object({
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  content: z.string().min(1),
  coverImageUrl: z.string().trim().url().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return jsonError("Please sign in to submit a blog post.", 401);
    }

    const parsed = submitSchema.parse(await request.json());

    const baseSlug = slugify(parsed.title);
    const timestamp = Date.now();
    const uniqueSlug = `${baseSlug}-${timestamp}`;

    const post = await prisma.blogPost.create({
      data: {
        title: parsed.title,
        slug: uniqueSlug,
        excerpt: parsed.excerpt || null,
        content: parsed.content,
        coverImageUrl: parsed.coverImageUrl || null,
        status: "DRAFT" as BlogStatus,
        publishedAt: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "BLOG_SUBMIT",
        entityType: "BlogPost",
        entityId: post.id,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.errors[0].message, 400);
    }
    return jsonError(
      error instanceof Error ? error.message : "Unable to submit blog post.",
      400,
    );
  }
}
