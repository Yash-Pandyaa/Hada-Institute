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

  // Deterministic IDs/tokens so this script is safe to run repeatedly.
  const seededAt = new Date();

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      passwordHash,
      name: "Placeholder Admin",
    },
    create: {
      id: "usr_admin_1",
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
    update: { permissions: ["*"], displayName: "Placeholder Admin" },
    create: {
      userId: admin.id,
      displayName: "Placeholder Admin",
      permissions: ["*"],
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {
      role: "USER",
      passwordHash,
      name: "Placeholder User",
    },
    create: {
      id: "usr_user_1",
      name: "Placeholder User",
      email: "user@example.com",
      role: "USER",
      passwordHash,
      phone: "+91-9000000000",
    },
  });

  await prisma.category.upsert({
    where: { slug: "foundation" },
    update: {},
    create: {
      id: "cat_1",
      name: "Foundation",
      slug: "foundation",
      description: "Mock category used for development.",
      sortOrder: 1,
      isPublished: true,
      imageUrl: "/images/note-cover-teal.svg",
    },
  });

  await prisma.category.upsert({
    where: { slug: "advanced" },
    update: {},
    create: {
      id: "cat_2",
      name: "Advanced",
      slug: "advanced",
      description: "Mock category used for development.",
      sortOrder: 2,
      isPublished: true,
      imageUrl: "/images/note-cover-blue.svg",
    },
  });

  await prisma.subject.upsert({
    where: { slug: "mathematics" },
    update: {},
    create: {
      id: "sub_1",
      name: "Mathematics",
      slug: "mathematics",
      description: "Mock subject used for development.",
      sortOrder: 1,
      isPublished: true,
    },
  });

  await prisma.subject.upsert({
    where: { slug: "physics" },
    update: {},
    create: {
      id: "sub_2",
      name: "Physics",
      slug: "physics",
      description: "Mock subject used for development.",
      sortOrder: 2,
      isPublished: true,
    },
  });

  // Products
  const products = [
    {
      id: "prd_1",
      title: "Mathematics - Foundation Notes",
      slug: "math-foundation-notes",
      subjectId: "sub_1",
      categoryId: "cat_1",
      classLevel: "Class 11",
      examType: "Mock Exam",
      description:
        "Development mock product. Replace with official content before launch.",
      thumbnailUrl: "/images/note-cover-teal.svg",
      previewImages: ["/images/note-cover-teal.svg"],
      price: 49900,
      compareAtPrice: 69900,
      discountPercent: 29,
      tags: ["Mock", "Digital PDF"],
      language: "English",
      featured: true,
      status: "PUBLISHED" as const,
      publishedAt: seededAt,
    },
    {
      id: "prd_2",
      title: "Mathematics - Advanced Notes",
      slug: "math-advanced-notes",
      subjectId: "sub_1",
      categoryId: "cat_2",
      classLevel: "Class 12",
      examType: "Board",
      description:
        "Development mock product. Replace with official content before launch.",
      thumbnailUrl: "/images/note-cover-blue.svg",
      previewImages: ["/images/note-cover-blue.svg"],
      price: 59900,
      compareAtPrice: 79900,
      discountPercent: 25,
      tags: ["Mock", "Revision"],
      language: "English",
      featured: false,
      status: "PUBLISHED" as const,
      publishedAt: seededAt,
    },
    {
      id: "prd_3",
      title: "Physics - Foundation Notes",
      slug: "physics-foundation-notes",
      subjectId: "sub_2",
      categoryId: "cat_1",
      classLevel: "Class 11",
      examType: "Mock Exam",
      description:
        "Development mock product. Replace with official content before launch.",
      thumbnailUrl: "/images/note-cover-amber.svg",
      previewImages: ["/images/note-cover-amber.svg"],
      price: 52900,
      compareAtPrice: 72900,
      discountPercent: 27,
      tags: ["Mock", "Concepts"],
      language: "English",
      featured: false,
      status: "PUBLISHED" as const,
      publishedAt: seededAt,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        subjectId: p.subjectId,
        categoryId: p.categoryId,
        classLevel: p.classLevel,
        examType: p.examType,
        description: p.description,
        thumbnailUrl: p.thumbnailUrl,
        previewImages: p.previewImages,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        discountPercent: p.discountPercent,
        tags: p.tags,
        language: p.language,
        featured: p.featured,
        status: p.status,
        publishedAt: p.publishedAt,
      },
      create: {
        id: p.id,
        title: p.title,
        slug: p.slug,
        subjectId: p.subjectId,
        categoryId: p.categoryId,
        classLevel: p.classLevel,
        examType: p.examType,
        description: p.description,
        thumbnailUrl: p.thumbnailUrl,
        previewImages: p.previewImages,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        discountPercent: p.discountPercent,
        tags: p.tags,
        language: p.language,
        featured: p.featured,
        status: p.status,
        publishedAt: p.publishedAt,
      },
    });
  }

  // OAuth / auth-related tables
  // Account: provider unique with providerAccountId
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: "google_usr_1",
      },
    },
    update: {
      userId: user.id,
    },
    create: {
      id: "acc_usr_1",
      userId: user.id,
      type: "oauth",
      provider: "google",
      providerAccountId: "google_usr_1",
      access_token: "mock_access_token",
      token_type: "Bearer",
      scope: "email profile",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      id_token: "mock_id_token",
      refresh_token: "mock_refresh_token",
      session_state: "mock_session_state",
    },
  });

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: "google_admin_1",
      },
    },
    update: {
      userId: admin.id,
    },
    create: {
      id: "acc_admin_1",
      userId: admin.id,
      type: "oauth",
      provider: "google",
      providerAccountId: "google_admin_1",
      access_token: "mock_access_token",
      token_type: "Bearer",
      scope: "email profile",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      id_token: "mock_id_token",
      refresh_token: "mock_refresh_token",
      session_state: "mock_session_state",
    },
  });

  await prisma.session.upsert({
    where: { sessionToken: "sess_user_1" },
    update: { userId: user.id, expires: seededAt },
    create: {
      id: "ses_1",
      userId: user.id,
      sessionToken: "sess_user_1",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  await prisma.verificationToken.upsert({
    where: { identifier_token: { identifier: "reg", token: "verify_token_1" } },
    update: { expires: seededAt },
    create: {
      identifier: "reg",
      token: "verify_token_1",
      expires: new Date(Date.now() + 1000 * 60 * 60),
    },
  });

  // Coupons
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      id: "coup_1",
      code: "WELCOME10",
      description: "10% off mock coupon",
      type: "PERCENTAGE",
      value: 10,
      minOrderValue: 10000,
      maxDiscount: 5000,
      usageLimit: 100,
      usageCount: 0,
      perUserLimit: 1,
      startsAt: seededAt,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      isActive: true,
    },
  });

  // Order + Items + Payment + DownloadAccess
  await prisma.order.upsert({
    where: { orderNumber: "ORD-1001" },
    update: {},
    create: {
      id: "ord_1",
      orderNumber: "ORD-1001",
      userId: user.id,
      status: "PAID",
      subtotal: 49900,
      discountTotal: 4990,
      total: 44910,
      currency: "INR",
      couponId: "coup_1",
      billingName: "Placeholder User",
      billingEmail: "user@example.com",
      billingPhone: "+91-9000000000",
      customerNote: "Mock order",
      razorpayOrderId: "rzp_order_mock_1",
      paidAt: seededAt,
    },
  });

  await prisma.orderItem.upsert({
    where: { id: "ord_item_1" },
    update: {},
    create: {
      id: "ord_item_1",
      orderId: "ord_1",
      productId: "prd_1",
      title: "Mathematics - Foundation Notes",
      unitPrice: 49900,
      quantity: 1,
      lineTotal: 49900,
      snapshot: { note: "Mock snapshot" },
    },
  });

  await prisma.payment.upsert({
    where: { razorpayPaymentId: "rzp_pay_mock_1" },
    update: {},
    create: {
      id: "pay_1",
      orderId: "ord_1",
      provider: "RAZORPAY",
      amount: 44910,
      currency: "INR",
      status: "CAPTURED",
      razorpayOrderId: "rzp_order_mock_1",
      razorpayPaymentId: "rzp_pay_mock_1",
      razorpaySignature: "rzp_signature_mock_1",
      failureReason: null,
      verifiedAt: seededAt,
      refundedAmount: 0,
      rawResponse: { mock: true },
    },
  });

  await prisma.downloadAccess.upsert({
    where: { token: "dl_token_1" },
    update: {},
    create: {
      id: "dl_1",
      userId: user.id,
      productId: "prd_1",
      orderItemId: "ord_item_1",
      token: "dl_token_1",
      status: "ACTIVE",
      downloadLimit: 5,
      downloadCount: 1,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      lastDownloadedAt: seededAt,
    },
  });

  await prisma.review.upsert({
    where: { productId_userId: { productId: "prd_1", userId: user.id } },
    update: {
      rating: 4,
      approved: true,
      title: "Great notes!",
      comment: "Mock review for development.",
    },
    create: {
      id: "rev_1",
      productId: "prd_1",
      userId: user.id,
      rating: 4,
      title: "Great notes!",
      comment: "Mock review for development.",
      approved: true,
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: "welcome-blog" },
    update: {},
    create: {
      id: "blog_1",
      title: "Welcome to Hada Institute",
      slug: "welcome-blog",
      excerpt: "Mock blog excerpt",
      content: "Mock blog content",
      coverImageUrl: "/images/note-cover-amber.svg",
      status: "PUBLISHED",
      publishedAt: seededAt,
      seoTitle: "Mock SEO title",
      seoDescription: "Mock SEO description",
    },
  });

  await prisma.contactMessage.upsert({
    where: { id: "contact_1" },
    update: {},
    create: {
      id: "contact_1",
      userId: user.id,
      name: "Placeholder User",
      email: "user@example.com",
      phone: "+91-9000000000",
      subject: "Mock contact",
      message: "This is a mock contact message for development.",
      source: "CONTACT_PAGE",
      resolved: false,
      createdAt: seededAt,
    },
  });

  await prisma.banner.upsert({
    where: { id: "banner_home_1" },
    update: {},
    create: {
      id: "banner_home_1",
      title: "Summer Sale - Mock",
      subtitle: "Mock campaign banner",
      imageUrl: "/images/note-cover-teal.svg",
      ctaLabel: "Get started",
      ctaHref: "/marketplace",
      placement: "HOME_HERO",
      isActive: true,
      startsAt: seededAt,
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      sortOrder: 1,
    },
  });

  await prisma.banner.upsert({
    where: { id: "banner_home_2" },
    update: {},
    create: {
      id: "banner_home_2",
      title: "New Arrivals - Mock",
      subtitle: "Mock campaign banner",
      imageUrl: "/images/note-cover-blue.svg",
      ctaLabel: "Browse",
      ctaHref: "/marketplace",
      placement: "HOME_HERO",
      isActive: true,
      startsAt: seededAt,
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      sortOrder: 2,
    },
  });

  await prisma.paymentWebhookLog.upsert({
    where: { id: "webhook_1" },
    update: {},
    create: {
      id: "webhook_1",
      provider: "RAZORPAY",
      event: "payment.captured",
      razorpayEventId: "rzp_event_mock_1",
      signature: "rzp_sig_mock_1",
      payload: { mock: true },
      processed: true,
      error: null,
      createdAt: seededAt,
    },
  });

  await prisma.auditLog.upsert({
    where: { id: "audit_1" },
    update: {},
    create: {
      id: "audit_1",
      actorId: admin.id,
      action: "SEED_MOCK_DATA",
      entityType: "SYSTEM",
      entityId: null,
      metadata: { seededAt: seededAt.toISOString() },
      ipAddress: "127.0.0.1",
      userAgent: "seed-script",
      createdAt: seededAt,
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
