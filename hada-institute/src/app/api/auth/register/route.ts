import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enforceRateLimit, getIp, jsonError } from "@/lib/security";
import { signUpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const ip = getIp(request);
  const limit = enforceRateLimit(`register:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  if (!limit.ok) {
    return jsonError("Too many registration attempts. Try again later.", 429);
  }

  const body = await request.json();
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid registration details", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true },
  });

  if (existing) {
    return jsonError("An account with this email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone || null,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
