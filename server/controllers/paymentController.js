/**
 * Payment Controller
 *
 * Handles the two-step Razorpay payment flow:
 *
 * STEP 1 — createOrder:
 *   Frontend says "I want plan X" →
 *   Server creates a Razorpay order →
 *   Returns orderId to frontend →
 *   Frontend opens Razorpay checkout popup
 *
 * STEP 2 — verifyPayment:
 *   Dealer completes payment in popup →
 *   Razorpay sends back paymentId + signature →
 *   Server VERIFIES the signature (anti-fraud check) →
 *   If valid → activates the subscription
 *
 * SIGNATURE VERIFICATION (why it matters):
 * Without verification, a hacker could:
 * 1. Open browser dev tools
 * 2. Fake a "payment successful" response
 * 3. Get a free subscription
 *
 * The signature is like a tamper-proof seal.
 * Razorpay signs the data with our secret key.
 * We re-create the signature on our end and compare.
 * If they match → payment is legit. If not → fraud detected.
 */
import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Plan from "../models/Plan.js";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";

/**
 * POST /api/payments/create-order
 *
 * Body: { planId: "665abc..." }
 * Returns: { orderId, amount, currency, planName }
 */
export async function createOrder(req, res) {
  try {
    const { planId } = req.body;

    // Validate input — planId is required
    if (!planId) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    // Look up the plan in our database
    // SECURITY: We NEVER trust the price from the frontend.
    // The frontend only sends the planId, and we fetch the real price from DB.
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Free plan doesn't need payment
    if (plan.priceMonthly === 0) {
      return res.status(400).json({ message: "Free plan doesn't require payment" });
    }

    // Create a Razorpay order
    // receipt = a unique ID we generate for our internal tracking
    // notes = metadata we attach to the order (visible in Razorpay dashboard)
    const order = await razorpay.orders.create({
      amount: plan.priceMonthly, // already in paise
      currency: "INR",
      // receipt must be <= 40 characters (Razorpay limit)
      // We use a shortened format: "sub_" + last 8 chars of dealer ID + timestamp
      receipt: `sub_${req.user.id.slice(-8)}_${Date.now()}`,
      notes: {
        dealerId: req.user.id,
        planId: plan._id.toString(),
        planName: plan.name,
      },
    });

    // Save a Payment record with status "created"
    // This is like printing a "pending" receipt before the customer pays
    await Payment.create({
      dealer: req.user.id,
      plan: plan._id,
      amount: plan.priceMonthly,
      razorpayOrderId: order.id,
      status: "created",
    });

    // Send back the order details to the frontend
    // The frontend needs orderId to open the Razorpay checkout popup
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name,
    });
  } catch (error) {
    console.error("createOrder error:", error.message || error.error?.description || error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
}

/**
 * POST /api/payments/verify
 *
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * Returns: { message: "Payment verified! Subscription activated." }
 *
 * This is the MOST CRITICAL function in the payment flow.
 * If this function has a bug, you could:
 * - Accept fake payments (bad for you)
 * - Reject real payments (bad for dealers)
 */
export async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // All three fields are required for verification
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification details" });
    }

    // ─── STEP 1: Verify the signature ───
    // Razorpay creates the signature by:
    // 1. Combining: orderId + "|" + paymentId
    // 2. Signing it with HMAC SHA256 using our key_secret
    //
    // We do the SAME thing and compare results.
    // If someone tampered with the data, the signatures won't match.
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // FRAUD DETECTED — signature doesn't match
      // Mark the payment as failed in our records
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );
      return res.status(400).json({ message: "Payment verification failed — invalid signature" });
    }

    // ─── STEP 2: Update payment record to "paid" ───
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
      { new: true } // return the updated document, not the old one
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // ─── STEP 3: Cancel any existing active subscription ───
    // A dealer can only have ONE active subscription at a time.
    // If they had a Starter plan and just paid for Pro,
    // we cancel Starter before activating Pro.
    await Subscription.updateMany(
      { dealer: payment.dealer, status: "active" },
      { status: "cancelled" }
    );

    // ─── STEP 4: Create new active subscription ───
    // Valid for 30 days from now (monthly billing cycle)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const subscription = await Subscription.create({
      dealer: payment.dealer,
      plan: payment.plan,
      status: "active",
      startDate,
      endDate,
      payment: payment._id,
    });

    // Populate the plan name for the response
    await subscription.populate("plan");

    res.json({
      message: "Payment verified! Subscription activated.",
      subscription: {
        plan: subscription.plan.name,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
    });
  } catch (error) {
    console.error("verifyPayment error:", error.message);
    res.status(500).json({ message: "Payment verification failed" });
  }
}
