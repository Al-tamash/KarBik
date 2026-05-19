/**
 * Payment Routes — Maps URLs to payment controller functions
 *
 * Two endpoints (both require dealer login):
 * POST /api/payments/create-order → Create a Razorpay order (before checkout)
 * POST /api/payments/verify       → Verify payment and activate subscription
 *
 * Both are POST because they CREATE or MODIFY data.
 * Both require protect (logged in) + dealerOnly (must be a dealer).
 * A buyer has no business paying for dealer subscriptions.
 */
import { Router } from "express";
import { protect, dealerOnly } from "../middleware/protect.js";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";

export default function paymentRoutes(auth) {
  const router = Router();

  // Step 1 of payment: create order → get orderId for Razorpay popup
  router.post("/create-order", protect(auth), dealerOnly, createOrder);

  // Step 2 of payment: verify signature → activate subscription
  router.post("/verify", protect(auth), dealerOnly, verifyPayment);

  return router;
}
