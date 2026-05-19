/**
 * Subscription Controller
 *
 * Handles all subscription-related logic:
 * - Listing available plans (public — anyone can see pricing)
 * - Getting a dealer's current active plan (protected — dealers only)
 *
 * CONCEPT: Controller vs Route
 * The route file is like a phone directory ("call this number for billing").
 * The controller is the actual person who picks up and handles the call.
 * We separate them so routes stay thin and logic stays testable.
 */
import Plan from "../models/Plan.js";
import Subscription from "../models/Subscription.js";

/**
 * GET /api/subscriptions/plans — List all available plans
 *
 * Public endpoint — no login required.
 * Used by the /pricing page to show plan cards.
 * Sorted by sortOrder so Free appears first, then Starter, then Pro.
 */
export async function getPlans(req, res) {
  try {
    // Only return plans where isActive = true
    // sort by sortOrder ascending (1 = first)
    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json(plans);
  } catch (error) {
    console.error("getPlans error:", error.message);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
}

/**
 * GET /api/subscriptions/my-plan — Get the dealer's active subscription
 *
 * Protected endpoint — must be logged in.
 *
 * Logic:
 * 1. Search for a subscription that is:
 *    - Owned by this dealer
 *    - Status is "active"
 *    - endDate is still in the future (not expired)
 * 2. If found → return it with the plan details (via populate)
 * 3. If NOT found → return the free plan as a fallback
 *    (every dealer gets the free tier by default)
 */
export async function getMyPlan(req, res) {
  try {
    const subscription = await Subscription.findOne({
      dealer: req.user.id,
      status: "active",
      // $gt means "greater than" — endDate must be after right now
      endDate: { $gt: new Date() },
    }).populate("plan"); // populate replaces the plan ObjectId with the full Plan document

    if (!subscription) {
      // No active paid subscription — dealer is on the free tier
      const freePlan = await Plan.findOne({ slug: "free" });
      return res.json({
        subscription: null,
        plan: freePlan,
        isFreeTier: true,
      });
    }

    res.json({
      subscription,
      plan: subscription.plan,
      isFreeTier: false,
    });
  } catch (error) {
    console.error("getMyPlan error:", error.message);
    res.status(500).json({ message: "Failed to fetch subscription" });
  }
}
