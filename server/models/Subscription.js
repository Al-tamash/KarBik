/**
 * Subscription Model (Mongoose Schema)
 *
 * A Subscription is like a "membership card" at a gym.
 * It says: "Altamash has a PRO membership, valid until June 14, 2026"
 *
 * KEY DESIGN DECISIONS:
 * 1. One active subscription per dealer at a time
 *    → When upgrading, old sub is marked "cancelled", new one is "active"
 * 2. We track both startDate and endDate (not just endDate)
 *    → Useful for showing "You've been subscribed since..."
 * 3. We link to the Payment that activated this subscription
 *    → For audit trail: "This sub was activated by payment #xyz"
 *
 * STATUS LIFECYCLE:
 * "active" → dealer is currently using this plan
 * "expired" → endDate has passed, needs renewal
 * "cancelled" → dealer upgraded or manually cancelled
 */
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    // Which dealer owns this subscription
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Which plan they subscribed to
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    // Current state of the subscription
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },

    // When the subscription period started
    startDate: {
      type: Date,
      default: Date.now,
    },

    // When it expires — typically startDate + 30 days
    // After this date, the subscription is treated as expired
    endDate: {
      type: Date,
      required: true,
    },

    // Reference to the payment that activated this subscription
    // Useful for: "Show me the receipt for this subscription"
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
