/**
 * Payment Model (Mongoose Schema)
 *
 * A Payment is like a RECEIPT you get after paying at a store.
 * We NEVER delete payment records — they're legal proof of transactions.
 *
 * THE RAZORPAY PAYMENT FLOW creates THREE IDs at different stages:
 *
 * 1. razorpayOrderId — created BEFORE payment
 *    → Our server tells Razorpay: "I want to charge ₹999"
 *    → Razorpay responds: "OK, here's order_AbCdEf123"
 *
 * 2. razorpayPaymentId — created DURING payment
 *    → Dealer enters card/UPI → Razorpay processes it
 *    → Razorpay gives back: "Payment pay_XyZ789 was successful"
 *
 * 3. razorpaySignature — created AFTER payment
 *    → Razorpay signs the data with our secret key
 *    → We verify this to ensure nobody faked the payment
 *    → Like a tamper-proof seal on a medicine bottle
 *
 * STATUS LIFECYCLE:
 * "created" → order made, waiting for dealer to pay
 * "paid" → payment verified successfully
 * "failed" → signature didn't match (possible fraud) or payment declined
 */
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // Which dealer made this payment
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Which plan they paid for
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    // Amount in PAISE (₹999 = 99900)
    amount: {
      type: Number,
      required: true,
    },

    // Currency code — always "INR" for Indian Rupees
    currency: {
      type: String,
      default: "INR",
    },

    // Stage 1: Order ID — set when we CREATE the order
    razorpayOrderId: {
      type: String,
      required: true,
    },

    // Stage 2: Payment ID — set when dealer COMPLETES payment
    razorpayPaymentId: {
      type: String,
      default: null,
    },

    // Stage 3: Signature — set when we VERIFY the payment
    razorpaySignature: {
      type: String,
      default: null,
    },

    // Current status of this payment
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  {
    // createdAt = when the order was created
    // updatedAt = when the payment was verified
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
