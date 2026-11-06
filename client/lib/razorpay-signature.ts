import crypto from "crypto";

/**
 * Verify a Razorpay checkout signature: HMAC-SHA256 of "order_id|payment_id"
 * with the key secret, compared in constant time.
 */
export function isValidRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  let provided: Buffer;
  try {
    provided = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  // timingSafeEqual throws on length mismatch, so check first.
  if (provided.length !== expected.length) return false;
  return crypto.timingSafeEqual(expected, provided);
}
