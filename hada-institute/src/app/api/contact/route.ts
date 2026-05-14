import { NextResponse } from "next/server";
import { hasDatabaseUrl, prisma } from "@/lib/db";
import { enforceRateLimit, getIp, jsonError } from "@/lib/security";
import { contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const ip = getIp(request);
  const limit = enforceRateLimit(`contact:${ip}`, {
    limit: 8,
    windowMs: 60 * 60 * 1000,
  });

  if (!limit.ok) {
    return jsonError("Too many messages. Try again later.", 429);
  }

  const parsed = contactSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid contact form", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  if (!hasDatabaseUrl) {
    return NextResponse.json({
      ok: true,
      stored: false,
      message: "Database not configured; message accepted in preview mode.",
    });
  }

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    },
  });

  return NextResponse.json({ ok: true, stored: true });
}
