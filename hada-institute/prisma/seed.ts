import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

loadEnvConfig(process.cwd());

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/hada_institute?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
});

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe@12345";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      passwordHash,
    },
    create: {
      name: "Placeholder Admin",
      email: adminEmail,
      role: "ADMIN",
      passwordHash,
      adminProfile: {
        create: {
          displayName: "Placeholder Admin",
          permissions: ["*"],
        },
      },
    },
  });

  await prisma.admin.upsert({
    where: { userId: admin.id },
    update: { permissions: ["*"] },
    create: {
      userId: admin.id,
      displayName: "Placeholder Admin",
      permissions: ["*"],
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: "placeholder-foundation" },
    update: {},
    create: {
      name: "Placeholder Foundation",
      slug: "placeholder-foundation",
      description:
        "Placeholder category. Replace with official institute category data.",
    },
  });

  const subject = await prisma.subject.upsert({
    where: { slug: "placeholder-subject" },
    update: {},
    create: {
      name: "Placeholder Subject",
      slug: "placeholder-subject",
      description:
        "Placeholder subject. Replace with verified official subject data.",
    },
  });

  await prisma.product.upsert({
    where: { slug: "placeholder-foundation-notes" },
    update: {},
    create: {
      title: "Placeholder Foundation Notes",
      slug: "placeholder-foundation-notes",
      subjectId: subject.id,
      categoryId: category.id,
      classLevel: "Placeholder class",
      examType: "Placeholder exam",
      description:
        "Placeholder product for development only. Replace with official notes, pricing, preview images, and PDFs before launch.",
      thumbnailUrl: "/images/note-cover-teal.svg",
      previewImages: ["/images/note-cover-teal.svg"],
      price: 49900,
      compareAtPrice: 69900,
      discountPercent: 29,
      tags: ["Placeholder", "Digital PDF"],
      language: "English",
      featured: true,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.banner.upsert({
    where: { id: "placeholder-home-banner" },
    update: {},
    create: {
      id: "placeholder-home-banner",
      title: "Placeholder banner",
      subtitle:
        "Replace with official institute campaign copy from verified sources.",
      ctaLabel: "Browse notes",
      ctaHref: "/marketplace",
      placement: "HOME_HERO",
      isActive: true,
    },
  });

  console.log(`Seed complete. Admin login: ${adminEmail}`);
}

main()
  .catch((error) => {
    if (isConnectionRefused(error)) {
      console.error(
        [
          "Cannot seed because PostgreSQL is not reachable.",
          `DATABASE_URL: ${databaseUrl}`,
          "",
          "Start PostgreSQL first, then run:",
          "  npm run prisma:migrate",
          "  npm run db:seed",
        ].join("\n"),
      );
      process.exit(1);
    }

    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

function isConnectionRefused(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const text = JSON.stringify(error, Object.getOwnPropertyNames(error));
  return text.includes("ECONNREFUSED") || text.includes("P1001");
}
