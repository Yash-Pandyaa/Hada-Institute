import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Ensure DATABASE_URL is available even when the runtime bypasses Next's env loading.
loadEnvConfig(process.cwd());

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  (hasDatabaseUrl
    ? new PrismaClient({
        adapter: new PrismaPg(process.env.DATABASE_URL ?? ""),
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
      })
    : (new Proxy(
        {},
        {
          get() {
            throw new Error(
              "DATABASE_URL is not configured. Add DATABASE_URL to your environment (e.g., .env) and restart the app.",
            );
          },
        },
      ) as PrismaClient));

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
