import { ProductStatus } from "@prisma/client";
import { hasDatabaseUrl, prisma } from "@/lib/db";
import type { StorefrontProduct } from "@/lib/placeholders";

export async function getFeaturedProducts() {
  // Admin-created content must be fully database-driven.
  // If the DB is not configured, return an empty list (no placeholders).
  if (!hasDatabaseUrl) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: { status: ProductStatus.PUBLISHED, featured: true },
    include: { category: true, subject: true },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  return products.map(mapProduct);
}

export async function getMarketplaceProducts(filters?: {
  q?: string;
  category?: string;
  subject?: string;
  maxPrice?: number;
}) {
  if (!hasDatabaseUrl) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      status: ProductStatus.PUBLISHED,
      ...(filters?.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: "insensitive" } },
              { description: { contains: filters.q, mode: "insensitive" } },
              { tags: { has: filters.q } },
            ],
          }
        : {}),
      ...(filters?.category ? { category: { slug: filters.category } } : {}),
      ...(filters?.subject ? { subject: { slug: filters.subject } } : {}),
      ...(filters?.maxPrice ? { price: { lte: filters.maxPrice } } : {}),
    },
    include: { category: true, subject: true },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  });

  return products.map(mapProduct);
}

export async function getProductBySlug(slug: string) {
  if (!hasDatabaseUrl) {
    return null;
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      subject: true,
      reviews: {
        where: { approved: true },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product || product.status !== ProductStatus.PUBLISHED) {
    return null;
  }

  return mapProduct(product);
}

export async function getFilters() {
  if (!hasDatabaseUrl) {
    return { categories: [], subjects: [] };
  }

  const [categories, subjects] = await Promise.all([
    prisma.category.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { name: true, slug: true },
    }),
    prisma.subject.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { name: true, slug: true },
    }),
  ]);

  return { categories, subjects };
}

export async function getPublishedBlogPosts(limit?: number) {
  if (!hasDatabaseUrl) {
    return [];
  }

  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getDashboardStats() {
  if (!hasDatabaseUrl) {
    return {
      totalSales: 0,
      monthlyRevenue: 0,
      activeUsers: 0,
      products: 0,
      recentOrders: [],
      topProducts: [],
      revenueSeries: [],
    };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalSales, monthlyRevenue, activeUsers, products, recentOrders] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "PARTIALLY_REFUNDED"] } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ["PAID", "PARTIALLY_REFUNDED"] },
          paidAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.product.count(),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: true, items: true },
        take: 8,
      }),
    ]);

  const topProducts = await prisma.orderItem.groupBy({
    by: ["productId", "title"],
    where: { order: { status: { in: ["PAID", "PARTIALLY_REFUNDED"] } } },
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { lineTotal: "desc" } },
    take: 5,
  });

  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const paidOrders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "PARTIALLY_REFUNDED"] },
      paidAt: { gte: since },
    },
    select: { total: true, paidAt: true },
  });

  const revenueSeries = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(since);
    date.setMonth(since.getMonth() + index);
    return {
      label: date.toLocaleString("en-IN", { month: "short" }),
      revenue: 0,
      month: date.getMonth(),
      year: date.getFullYear(),
    };
  });

  for (const order of paidOrders) {
    if (!order.paidAt) {
      continue;
    }
    const bucket = revenueSeries.find(
      (item) =>
        item.month === order.paidAt?.getMonth() &&
        item.year === order.paidAt?.getFullYear(),
    );
    if (bucket) {
      bucket.revenue += order.total;
    }
  }

  return {
    totalSales: totalSales._sum.total ?? 0,
    monthlyRevenue: monthlyRevenue._sum.total ?? 0,
    activeUsers,
    products,
    recentOrders,
    topProducts,
    revenueSeries: revenueSeries.map(({ label, revenue }) => ({
      label,
      revenue,
    })),
  };
}

type ProductWithRelations = Awaited<
  ReturnType<typeof prisma.product.findMany>
>[number] & {
  category?: { name: string } | null;
  subject?: { name: string } | null;
};

function mapProduct(product: ProductWithRelations): StorefrontProduct {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    subject: product.subject?.name ?? "General",
    category: product.category?.name ?? "Notes",
    classLevel: product.classLevel ?? "All classes",
    examType: product.examType ?? "General",
    description: product.description,
    thumbnailUrl: product.thumbnailUrl || "/images/note-cover-teal.svg",
    previewImages: product.previewImages,
    samplePdfUrl: product.samplePdfUrl ?? "",
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    discountPercent: product.discountPercent,
    tags: product.tags,
    language: product.language,
    featured: product.featured,
    stockStatus: product.stockStatus,
  };
}

export type AdminCmsDashboardOverview = {
  counts: {
    blogs: { draft: number; published: number };
    products: { draft: number; published: number; archived: number };
    subjectNotes: { draft: number; published: number };
    banners: { active: number; inactive: number };
  };
};

export async function getAdminCmsDashboardOverview(): Promise<
  AdminCmsDashboardOverview
> {
  if (!hasDatabaseUrl) {
    return {
      counts: {
        blogs: { draft: 0, published: 0 },
        products: { draft: 0, published: 0, archived: 0 },
        subjectNotes: { draft: 0, published: 0 },
        banners: { active: 0, inactive: 0 },
      },
    };
  }

  const [blogs, products, subjectNotes, banners] = await Promise.all([
    Promise.all([
      prisma.blogPost.count({ where: { status: "DRAFT" } }),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    ]),
    Promise.all([
      prisma.product.count({ where: { status: "DRAFT" } }),
      prisma.product.count({ where: { status: "PUBLISHED" } }),
      prisma.product.count({ where: { status: "ARCHIVED" } }),
    ]),
    Promise.all([
      prisma.subjectNote.count({ where: { status: "DRAFT" } }),
      prisma.subjectNote.count({ where: { status: "PUBLISHED" } }),
    ]),
    Promise.all([
      prisma.banner.count({ where: { isActive: true } }),
      prisma.banner.count({ where: { isActive: false } }),
    ]),
  ]);

  return {
    counts: {
      blogs: { draft: blogs[0], published: blogs[1] },
      products: { draft: products[0], published: products[1], archived: products[2] },
      subjectNotes: { draft: subjectNotes[0], published: subjectNotes[1] },
      banners: { active: banners[0], inactive: banners[1] },
    },
  };
}

type AdminRecentUploadItem = {
  id: string;
  type: "Product" | "SubjectNote";
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: Date;
  thumbnailUrl?: string | null;
};

export async function getAdminRecentUploads(params?: {
  take?: number;
}): Promise<AdminRecentUploadItem[]> {
  const take = Math.min(params?.take ?? 8, 20);

  if (!hasDatabaseUrl) {
    return [];
  }

  const [products, subjectNotes] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [
          { fullPdfKey: { not: null } },
          { samplePdfUrl: { not: null } },
          { thumbnailKey: { not: null } },
          { thumbnailUrl: { not: null } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        thumbnailUrl: true,
      },
      orderBy: { updatedAt: "desc" },
      take,
    }),
    prisma.subjectNote.findMany({
      where: {
        OR: [
          { pdfKey: { not: null } },
          { pdfUrl: { not: null } },
          { thumbnailKey: { not: null } },
          { thumbnailUrl: { not: null } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        thumbnailUrl: true,
      },
      orderBy: { updatedAt: "desc" },
      take,
    }),
  ]);

  const mapped: AdminRecentUploadItem[] = [
    ...products.map((p) => ({
      id: p.id,
      type: "Product" as const,
      title: p.title,
      slug: p.slug,
      status: p.status,
      updatedAt: p.updatedAt,
      thumbnailUrl: p.thumbnailUrl,
    })),
    ...subjectNotes.map((n) => ({
      id: n.id,
      type: "SubjectNote" as const,
      title: n.title,
      slug: n.slug,
      status: n.status,
      updatedAt: n.updatedAt,
      thumbnailUrl: n.thumbnailUrl,
    })),
  ];

  mapped.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return mapped.slice(0, take);
}

type AdminContentStatistics = {
  featuredProducts: number;
  featuredSubjectNotes: number;
  activeBanners: number;
  draftsTotal: number;
  publishedTotal: number;
};

export async function getAdminContentStatistics(): Promise<
  AdminContentStatistics
> {
  if (!hasDatabaseUrl) {
    return {
      featuredProducts: 0,
      featuredSubjectNotes: 0,
      activeBanners: 0,
      draftsTotal: 0,
      publishedTotal: 0,
    };
  }

  const [featuredProducts, featuredSubjectNotes, activeBanners, drafts, published] =
    await Promise.all([
      prisma.product.count({ where: { status: "PUBLISHED", featured: true } }),
      prisma.subjectNote.count({ where: { status: "PUBLISHED", isFeatured: true } }),
      prisma.banner.count({ where: { isActive: true } }),
      prisma.blogPost.count({ where: { status: "DRAFT" } }).then(async (blogDrafts) => {
        const [productDrafts, noteDrafts] = await Promise.all([
          prisma.product.count({ where: { status: "DRAFT" } }),
          prisma.subjectNote.count({ where: { status: "DRAFT" } }),
        ]);
        return blogDrafts + productDrafts + noteDrafts;
      }),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }).then(async (blogPublished) => {
        const [productPublished, notePublished] = await Promise.all([
          prisma.product.count({ where: { status: "PUBLISHED" } }),
          prisma.subjectNote.count({ where: { status: "PUBLISHED" } }),
        ]);
        return blogPublished + productPublished + notePublished;
      }),
    ]);

  return {
    featuredProducts,
    featuredSubjectNotes,
    activeBanners,
    draftsTotal: drafts,
    publishedTotal: published,
  };
}

type AdminRecentActivityItem = {
  id: string;
  createdAt: Date;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: unknown;
};

export async function getAdminRecentActivity(params?: {
  take?: number;
}): Promise<AdminRecentActivityItem[]> {
  const take = Math.min(params?.take ?? 20, 50);

  if (!hasDatabaseUrl) {
    return [];
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: {
      actor: {
        select: { email: true },
      },
    },
  });

  return logs.map((l) => ({
    id: l.id,
    createdAt: l.createdAt,
    actorEmail: l.actor?.email ?? null,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    metadata: l.metadata ?? undefined,
  }));
}

