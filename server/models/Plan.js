/**
 * Plan Model (Mongoose Schema)
 *
 * A Plan is like a "menu item" at a restaurant — it defines what
 * the dealer gets for a specific price.
 *
 * We store plans in the database (not hardcoded) because:
 * 1. We can add/edit plans without redeploying the server
 * 2. Subscriptions reference plan._id — we need real documents
 * 3. An admin dashboard can manage plans later
 *
 * IMPORTANT: Razorpay works in PAISE, not Rupees.
 * ₹999 = 99900 paise. This avoids floating-point math issues.
 * (Same reason banks store cents, not dollars)
 */
import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    // Plan display name — e.g., "Free", "Starter", "Pro"
    name: {
      type: String,
      required: [true, "Plan name is required"],
      unique: true,
      trim: true,
    },

    // URL-safe identifier — e.g., "free", "starter", "pro"
    // Used in API calls and URLs instead of MongoDB _id
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Monthly price in PAISE (₹999 = 99900 paise)
    // 0 = free plan (no payment needed)
    priceMonthly: {
      type: Number,
      required: true,
      default: 0,
    },

    // Human-readable price for display — e.g., "₹999/month"
    // We store this separately because formatting paise → rupees
    // every time on the frontend is tedious and error-prone
    priceLabel: {
      type: String,
      default: "Free",
    },

    // Maximum number of car listings this plan allows
    // Free = 5, Starter = 25, Pro = 9999 (effectively unlimited)
    listingLimit: {
      type: Number,
      required: true,
      default: 5,
    },

    // Number of boost credits per month (used in Phase 8)
    boostsPerMonth: {
      type: Number,
      default: 0,
    },

    // Feature flags — what's included in this plan
    // Each flag is a boolean switch that the frontend/backend
    // can check to enable or disable features
    features: {
      dashboard: { type: Boolean, default: true },
      analytics: { type: Boolean, default: false },
      whatsappIntegration: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      // Badge text shown next to dealer name: null, "Verified", "Verified PRO"
      dealerBadge: { type: String, default: null },
    },

    // Controls display order on the pricing page (1 = leftmost)
    sortOrder: {
      type: Number,
      default: 0,
    },

    // Is this plan currently available for purchase?
    // Set to false to hide a plan without deleting it
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // timestamps adds createdAt and updatedAt automatically
    timestamps: true,
  }
);

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
