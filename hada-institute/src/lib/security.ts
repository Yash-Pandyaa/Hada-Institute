import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type RateBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateBucket>();

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function hmacSha256(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSecureToken(size = 32) {
  return crypto.randomBytes(size).toString("hex");
}

export async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();

  if (session.user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return session;
}

export function enforceRateLimit(
  key: string,
  options: { limit: number; windowMs: number },
) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true, remaining: options.limit - 1 };
  }

  if (existing.count >= options.limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { ok: true, remaining: options.limit - existing.count };
}

export function getIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export function sanitizeCsvCell(value: unknown) {
  const text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) {
    return `'${text}`;
  }
  return text.replaceAll('"', '""');
}
