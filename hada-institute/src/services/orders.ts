import {
  OrderStatus,
  PaymentStatus,
  type Prisma,
  ProductStatus,
  StockStatus,
} from "@prisma/client";
import { addDays } from "date-fns";
import type { z } from "zod";
import { prisma } from "@/lib/db";
import { getRazorpayClient } from "@/lib/razorpay";
import { createSecureToken } from "@/lib/security";
import type { checkoutSchema } from "@/lib/validation";

type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function createCheckoutOrder(
  input: CheckoutInput,
  userId: string,
) {
  const productIds = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      status: ProductStatus.PUBLISHED,
      stockStatus: StockStatus.AVAILABLE,
    },
  });

  if (products.length !== new Set(productIds).size) {
    throw new Error("One or more products are unavailable.");
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const lineItems = input.items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error("Product not found.");
    }

    return {
      product,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    };
  });

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const coupon = input.couponCode
    ? await prisma.coupon.findUnique({
        where: { code: input.couponCode.toUpperCase() },
      })
    : null;
  const discountTotal = coupon ? calculateCouponDiscount(coupon, subtotal) : 0;
  const total = Math.max(subtotal - discountTotal, 0);
  const orderNumber = createOrderNumber();

  if (coupon && discountTotal <= 0) {
    throw new Error("Coupon is not applicable to this order.");
  }

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      subtotal,
      discountTotal,
      total,
      couponId: coupon?.id,
      billingName: input.billingName,
      billingEmail: input.billingEmail,
      billingPhone: input.billingPhone,
      items: {
        create: lineItems.map(({ product, quantity, lineTotal }) => ({
          productId: product.id,
          title: product.title,
          unitPrice: product.price,
          quantity,
          lineTotal,
          snapshot: {
            slug: product.slug,
            subjectId: product.subjectId,
            categoryId: product.categoryId,
            fullPdfKey: product.fullPdfKey,
          },
        })),
      },
      payments: {
        create: {
          amount: total,
          currency: "INR",
          status: PaymentStatus.CREATED,
        },
      },
    },
    include: { payments: true },
  });

  const razorpayOrder = await getRazorpayClient().orders.create({
    amount: total,
    currency: "INR",
    receipt: order.orderNumber,
    notes: {
      internalOrderId: order.id,
      userId,
    },
  });

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    }),
    prisma.payment.update({
      where: { id: order.payments[0].id },
      data: {
        razorpayOrderId: razorpayOrder.id,
        rawResponse: razorpayOrder as unknown as Prisma.InputJsonValue,
      },
    }),
    ...(coupon
      ? [
          prisma.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: { increment: 1 } },
          }),
        ]
      : []),
  ]);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    razorpayOrderId: razorpayOrder.id,
    amount: total,
    currency: "INR",
  };
}

export async function markOrderPaid(input: {
  orderId: string;
  userId?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  rawResponse?: Prisma.InputJsonValue;
}) {
  const order = await prisma.order.findFirst({
    where: {
      id: input.orderId,
      razorpayOrderId: input.razorpayOrderId,
      ...(input.userId ? { userId: input.userId } : {}),
    },
    include: { items: true },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PAID,
        paidAt: new Date(),
      },
    });

    await tx.payment.upsert({
      where: { razorpayPaymentId: input.razorpayPaymentId },
      update: {
        status: PaymentStatus.CAPTURED,
        razorpaySignature: input.razorpaySignature,
        verifiedAt: new Date(),
        rawResponse: input.rawResponse,
      },
      create: {
        orderId: order.id,
        amount: order.total,
        currency: order.currency,
        status: PaymentStatus.CAPTURED,
        razorpayOrderId: input.razorpayOrderId,
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature,
        verifiedAt: new Date(),
        rawResponse: input.rawResponse,
      },
    });

    for (const item of order.items) {
      await tx.downloadAccess.upsert({
        where: {
          userId_productId_orderItemId: {
            userId: order.userId,
            productId: item.productId,
            orderItemId: item.id,
          },
        },
        update: {
          status: "ACTIVE",
        },
        create: {
          userId: order.userId,
          productId: item.productId,
          orderItemId: item.id,
          token: createSecureToken(24),
          expiresAt: addDays(new Date(), 365),
        },
      });
    }
  });

  return order;
}

export async function markPaymentFailed(input: {
  razorpayOrderId: string;
  reason?: string;
  rawResponse?: Prisma.InputJsonValue;
}) {
  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: input.razorpayOrderId },
  });

  if (!order) {
    return;
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.FAILED },
    }),
    prisma.payment.updateMany({
      where: { razorpayOrderId: input.razorpayOrderId },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: input.reason,
        rawResponse: input.rawResponse,
      },
    }),
  ]);
}

function calculateCouponDiscount(
  coupon: {
    type: "PERCENTAGE" | "FIXED";
    value: number;
    minOrderValue: number;
    maxDiscount: number | null;
    usageLimit: number | null;
    usageCount: number;
    startsAt: Date | null;
    expiresAt: Date | null;
    isActive: boolean;
  },
  subtotal: number,
) {
  const now = new Date();

  if (!coupon.isActive) {
    return 0;
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    return 0;
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    return 0;
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return 0;
  }

  if (subtotal < coupon.minOrderValue) {
    return 0;
  }

  const discount =
    coupon.type === "PERCENTAGE"
      ? Math.floor((subtotal * coupon.value) / 100)
      : coupon.value;

  return Math.min(discount, coupon.maxDiscount ?? discount, subtotal);
}

function createOrderNumber() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `HD-${Date.now()}-${random}`;
}
