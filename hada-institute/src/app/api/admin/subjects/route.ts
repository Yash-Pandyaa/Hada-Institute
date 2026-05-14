import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/security";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = schema.parse(await request.json());
    const subject = await prisma.subject.create({
      data: {
        name: parsed.name,
        slug: slugify(parsed.name),
        description: parsed.description || null,
      },
    });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to create subject.",
      400,
    );
  }
}
