import { ProductStatus } from "@prisma/client";
import { hasDatabaseUrl, prisma } from "@/lib/db";
import {
  placeholderCategories,
  placeholderProducts,
  placeholderSubjects,
  type StorefrontProduct,
} from "@/lib/placeholders";

export async function getFeaturedProducts() {
  if (!hasDatabaseUrl) {
    return placeholderProducts.filter((product) => product.featured);
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
    return placeholderProducts.filter((product) => {
      const query = filters?.q?.toLowerCase();
      if (!query) {
        return true;
      }
      return `${product.title} ${product.subject} ${product.category}`
        .toLowerCase()
        .includes(query);
    });
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
    return placeholderProducts.find((product) => product.slug === slug) ?? null;
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
    return {
      categories: placeholderCategories.map((name) => ({
        name,
        slug: name.toLowerCase().replaceAll(" ", "-"),
      })),
      subjects: placeholderSubjects.map((name) => ({
        name,
        slug: name.toLowerCase().replaceAll(" ", "-"),
      })),
    };
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
