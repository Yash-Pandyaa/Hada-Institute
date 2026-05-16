import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Fail fast: Prisma Client is evaluated during Next build/runtime.
  // Supabase/production requires DATABASE_URL to exist.
  throw new Error(
    "DATABASE_URL is not configured. Add DATABASE_URL to your environment and restart.",
  );
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    adapter: new PrismaPg(databaseUrl),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
