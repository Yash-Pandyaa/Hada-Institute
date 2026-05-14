import { z } from "zod";

export const emailSchema = z.string().email().max(254);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  phone: z.string().trim().max(24).optional().or(z.literal("")),
  password: passwordSchema,
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  phone: z.string().trim().max(24).optional().or(z.literal("")),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(4000),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(10).default(1),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
  billingName: z.string().trim().min(2).max(100),
  billingEmail: emailSchema,
  billingPhone: z.string().trim().min(8).max(24),
});

export const razorpayVerifySchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const productSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(10000),
  subjectId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  classLevel: z.string().trim().max(80).optional().or(z.literal("")),
  examType: z.string().trim().max(100).optional().or(z.literal("")),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  previewImages: z.array(z.string().url()).default([]),
  samplePdfUrl: z.string().url().optional().or(z.literal("")),
  fullPdfKey: z.string().trim().max(600).optional().or(z.literal("")),
  fullPdfUrl: z.string().url().optional().or(z.literal("")),
  price: z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).optional().nullable(),
  discountPercent: z.number().int().min(0).max(95).default(0),
  tags: z.array(z.string().trim().max(40)).default([]),
  language: z.string().trim().min(2).max(40).default("English"),
  stockStatus: z.enum(["AVAILABLE", "OUT_OF_STOCK"]).default("AVAILABLE"),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export const couponSchema = z.object({
  code: z.string().trim().min(3).max(40),
  description: z.string().trim().max(240).optional().or(z.literal("")),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().int().min(1),
  minOrderValue: z.number().int().min(0).default(0),
  maxDiscount: z.number().int().min(0).optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  perUserLimit: z.number().int().min(1).default(1),
  startsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
});
