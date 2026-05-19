import mongoose from "mongoose";

/**
 * PushSubscription Schema
 * 
 * Stores the web-push subscription object for a user.
 * This allows us to send notifications even when the user is offline.
 */
const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: String, // Matches Better Auth userId
    required: true,
    index: true,
  },
  subscription: {
    endpoint: { type: String, required: true },
    expirationTime: { type: Number },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  deviceType: { type: String, default: "mobile" },
  createdAt: { type: Date, default: Date.now },
});

// Avoid duplicate subscriptions for the same endpoint
pushSubscriptionSchema.index({ "subscription.endpoint": 1 }, { unique: true });

export default mongoose.model("PushSubscription", pushSubscriptionSchema);
