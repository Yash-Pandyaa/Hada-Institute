import Razorpay from "razorpay";
import { hmacSha256, timingSafeEqual } from "@/lib/security";

let client: Razorpay | null = null;

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  if (!client) {
    client = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return client;
}

export function verifyRazorpayPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new Error("Razorpay key secret is not configured");
  }

  const expected = hmacSha256(
    `${input.razorpayOrderId}|${input.razorpayPaymentId}`,
    secret,
  );

  return timingSafeEqual(expected, input.razorpaySignature);
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Razorpay webhook secret is not configured");
  }

  const expected = hmacSha256(rawBody, secret);
  return timingSafeEqual(expected, signature);
}
