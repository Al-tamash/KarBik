/**
 * Subscription Enforcement Middleware
 *
 * This middleware checks if a dealer has hit their car listing limit
 * based on their current subscription plan.
 *
 * REAL-WORLD ANALOGY:
 * Think of a parking lot with limited spaces.
 * Free plan = 5 parking spots. Starter = 25. Pro = unlimited.
 * When a dealer tries to "park" a new car (create a listing),
 * this middleware checks: "Is there a spot available?"
 * If the lot is full → "Sorry, upgrade your plan for more spots."
 *
 * PLACEMENT IN THE MIDDLEWARE CHAIN:
 * protect(auth) → dealerOnly → checkListingLimit() → upload → createCar
 *
 * It runs AFTER we know who the dealer is (protect)
 * but BEFORE we upload images (no point uploading if the listing
 * will be rejected anyway — saves bandwidth and Cloudinary storage).
 */
import Subscription from "../models/Subscription.js";
import Plan from "../models/Plan.js";
import Car from "../models/Car.js";

export function checkListingLimit() {
  return async (req, res, next) => {
    try {
      // Step 1: Find the dealer's active subscription
      const subscription = await Subscription.findOne({
        dealer: req.user.id,
        status: "active",
        endDate: { $gt: new Date() }, // not expired
      }).populate("plan");

      // Step 2: Determine the listing limit
      // If no active subscription → use free plan defaults (5 listings)
      let listingLimit = 5;
      let planName = "Free";

      if (subscription && subscription.plan) {
        listingLimit = subscription.plan.listingLimit;
        planName = subscription.plan.name;
      }

      // Step 3: Count the dealer's current listings
      const currentCount = await Car.countDocuments({ dealer: req.user.id });

      // Step 4: Block if limit is reached
      if (currentCount >= listingLimit) {
        return res.status(403).json({
          message: `You've reached your listing limit (${currentCount}/${listingLimit}) on the ${planName} plan. Upgrade to list more cars.`,
          currentCount,
          listingLimit,
          planName,
          upgradeRequired: true,
        });
      }

      // Attach plan info to the request for use in the controller
      // (e.g., showing "2 of 5 listings used" in the response)
      req.subscription = { listingLimit, currentCount, planName };
      next();
    } catch (error) {
      console.error("checkListingLimit error:", error.message);
      res.status(500).json({ message: "Failed to check subscription limits" });
    }
  };
}
